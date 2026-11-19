"""Tests for the ACE Prep server. Google token verification is mocked.

Run: pip install -r server/requirements.txt -r server/requirements-dev.txt && pytest server
"""
import importlib
import json
import os

import pytest
from fastapi.testclient import TestClient

H = {"X-Requested-With": "fetch"}


@pytest.fixture()
def make_client(tmp_path, monkeypatch):
    def factory(**env):
        base = {
            "DATABASE_PATH": str(tmp_path / "test.db"),
            "GOOGLE_CLIENT_ID": "test-client.apps.googleusercontent.com",
            "ADMIN_EMAILS": "boss@example.com",
            "REGISTRATION_MODE": "approval",
            "COOKIE_SECURE": "false",
            "ALLOWED_EMAIL_DOMAINS": "",
            "PUBLIC_ORIGIN": "",
            "RATE_LIMITS_ENABLED": "true",
            "MAX_PENDING_USERS": "200",
        }
        base.update(env)
        for k, v in base.items():
            monkeypatch.setenv(k, v)
        import server.main as m
        m = importlib.reload(m)

        def fake_verify(token, request, audience):
            assert audience == base["GOOGLE_CLIENT_ID"]
            if token.startswith("bad"):
                raise ValueError("bad token")
            data = json.loads(token[len("token:"):])
            return {"iss": "https://accounts.google.com", "email_verified": True,
                    "name": data["email"].split("@")[0], "picture": "https://lh3.googleusercontent.com/x", **data}

        monkeypatch.setattr(m.google_id_token, "verify_oauth2_token", fake_verify)
        return m, TestClient(m.app)
    return factory


def tok(email, sub=None, **extra):
    return "token:" + json.dumps({"email": email, "sub": sub or "sub-" + email, **extra})


def login(client, email, **kw):
    return client.post("/api/auth/google", json={"credential": tok(email, **kw)}, headers=H)


def test_bootstrap_admin_and_approval_flow(make_client):
    m, admin = make_client()
    with admin:
        r = login(admin, "boss@example.com")
        assert r.status_code == 200 and r.json()["user"]["role"] == "admin"
        assert admin.get("/api/me").json()["user"]["email"] == "boss@example.com"

        user = TestClient(m.app)
        r = login(user, "alice@gmail.com")
        assert r.status_code == 403 and r.json()["status"] == "pending"
        assert user.get("/api/me").status_code == 401
        assert user.get("/data.json").status_code == 401

        users = admin.get("/api/admin/users").json()["users"]
        alice = next(u for u in users if u["email"] == "alice@gmail.com")
        assert alice["status"] == "pending"
        assert admin.patch(f"/api/admin/users/{alice['id']}", json={"status": "active"}, headers=H).status_code == 200

        assert login(user, "alice@gmail.com").status_code == 200
        assert user.get("/data.json").status_code == 200
        assert user.get("/api/admin/users").status_code == 403

        # Block signs her out immediately
        admin.patch(f"/api/admin/users/{alice['id']}", json={"status": "blocked"}, headers=H)
        assert user.get("/api/me").status_code == 401
        assert login(user, "alice@gmail.com").json()["status"] == "blocked"

        actions = [e["action"] for e in admin.get("/api/admin/audit").json()["entries"]]
        assert "user.registered" in actions and "user.updated" in actions


def test_state_roundtrip_and_validation(make_client):
    m, c = make_client(REGISTRATION_MODE="open")
    with c:
        assert login(c, "bob@gmail.com").status_code == 200
        assert c.get("/api/state").json() == {"state": None, "updatedAt": None}
        state = {"version": 1, "attempts": [{"mode": "mock", "pct": 80, "total": 50, "correct": 40, "finishedAt": 1}],
                 "qstats": {}, "prefs": {}, "session": None}
        assert c.put("/api/state", content=json.dumps(state), headers=H).status_code == 200
        assert c.get("/api/state").json()["state"]["attempts"][0]["pct"] == 80
        assert c.put("/api/state", content=json.dumps({"nope": 1}), headers=H).status_code == 400
        assert c.put("/api/state", content="x" * (m.MAX_STATE_BYTES + 1), headers=H).status_code == 413


def test_csrf_and_origin(make_client):
    m, c = make_client(REGISTRATION_MODE="open", PUBLIC_ORIGIN="https://ace.example.com")
    with c:
        r = c.post("/api/auth/google", json={"credential": tok("x@gmail.com")})
        assert r.status_code == 403  # missing X-Requested-With
        r = c.post("/api/auth/google", json={"credential": tok("x@gmail.com")},
                   headers={**H, "Origin": "https://evil.example"})
        assert r.status_code == 403
        r = c.post("/api/auth/google", json={"credential": tok("x@gmail.com")},
                   headers={**H, "Origin": "https://ace.example.com"})
        assert r.status_code == 200


def test_invite_mode_and_domains(make_client):
    m, admin = make_client(REGISTRATION_MODE="invite")
    with admin:
        login(admin, "boss@example.com")
        stranger = TestClient(m.app)
        assert login(stranger, "eve@gmail.com").json()["status"] == "not_invited"
        assert admin.post("/api/admin/users", json={"email": "Eve@Gmail.com"}, headers=H).status_code == 200
        assert login(stranger, "eve@gmail.com").status_code == 200
        assert admin.post("/api/admin/users", json={"email": "not-an-email"}, headers=H).status_code == 400

    m, c = make_client(REGISTRATION_MODE="open", ALLOWED_EMAIL_DOMAINS="corp.com")
    with c:
        assert login(c, "a@gmail.com").json()["status"] == "domain"
        assert login(c, "a@corp.com").status_code == 200


def test_admin_guards(make_client):
    m, admin = make_client(REGISTRATION_MODE="open")
    with admin:
        boss = login(admin, "boss@example.com").json()["user"]
        # cannot modify yourself / env admins
        assert admin.patch(f"/api/admin/users/{boss['id']}", json={"role": "user"}, headers=H).status_code == 400
        assert admin.delete(f"/api/admin/users/{boss['id']}", headers=H).status_code == 400

        other = TestClient(m.app)
        carol = login(other, "carol@gmail.com").json()["user"]
        assert admin.patch(f"/api/admin/users/{carol['id']}", json={"role": "admin"}, headers=H).status_code == 200
        # carol (admin) cannot demote the env admin
        assert other.patch(f"/api/admin/users/{boss['id']}", json={"role": "user"}, headers=H).status_code == 400
        # revoke sessions + delete
        assert admin.delete(f"/api/admin/users/{carol['id']}/sessions", headers=H).json()["revoked"] == 1
        assert other.get("/api/me").status_code == 401
        assert admin.delete(f"/api/admin/users/{carol['id']}", headers=H).status_code == 200
        assert all(u["email"] != "carol@gmail.com" for u in admin.get("/api/admin/users").json()["users"])


def test_bad_token_and_sub_mismatch(make_client):
    m, c = make_client(REGISTRATION_MODE="open")
    with c:
        assert c.post("/api/auth/google", json={"credential": "bad" + "x" * 30}, headers=H).status_code == 401
        assert login(c, "dan@gmail.com", sub="1").status_code == 200
        assert login(c, "dan@gmail.com", sub="2").status_code == 401


def test_static_whitelist(make_client):
    m, c = make_client()
    with c:
        assert c.get("/").status_code == 200
        assert c.get("/script.js").status_code == 200
        assert c.get("/README.MD").status_code == 404
        assert c.get("/server/main.py").status_code == 404
        assert "Content-Security-Policy" in c.get("/").headers
        assert c.get("/healthz").json() == {"ok": True}


# ---------------------------------------------------------------- rate limits
def ip(addr):
    return {**H, "CF-Connecting-IP": addr}


def test_login_rate_limit_per_ip(make_client):
    m, c = make_client(REGISTRATION_MODE="open")
    with c:
        login(c, "u@gmail.com")  # create the account once
        codes = [c.post("/api/auth/google", json={"credential": tok("u@gmail.com")}, headers=ip("1.1.1.1")).status_code
                 for _ in range(11)]
        assert codes[:10] == [200] * 10 and codes[10] == 429
        r = c.post("/api/auth/google", json={"credential": tok("u@gmail.com")}, headers=ip("1.1.1.1"))
        assert r.status_code == 429 and int(r.headers["Retry-After"]) > 0 and "try again" in r.json()["detail"]
        # a different visitor is unaffected
        assert c.post("/api/auth/google", json={"credential": tok("u@gmail.com")}, headers=ip("2.2.2.2")).status_code == 200


def test_registration_limits(make_client):
    m, c = make_client(REGISTRATION_MODE="open")
    with c:
        codes = [c.post("/api/auth/google", json={"credential": tok(f"n{i}@gmail.com")}, headers=ip("3.3.3.3")).status_code
                 for i in range(6)]
        assert codes == [200] * 5 + [429]
        # the refused sign-up was not saved
        assert c.post("/api/auth/google", json={"credential": tok("boss@example.com")}, headers=ip("4.4.4.4")).status_code == 200
        emails = {u["email"] for u in c.get("/api/admin/users").json()["users"]}
        assert "n5@gmail.com" not in emails and "n4@gmail.com" in emails
        # existing accounts can still sign in from the throttled IP
        assert c.post("/api/auth/google", json={"credential": tok("n0@gmail.com")}, headers=ip("3.3.3.3")).status_code == 200


def test_pending_cap(make_client):
    m, c = make_client(MAX_PENDING_USERS="2")
    with c:
        statuses = [c.post("/api/auth/google", json={"credential": tok(f"p{i}@gmail.com")}, headers=ip(f"5.5.5.{i}")).json()["status"]
                    for i in range(3)]
        assert statuses == ["pending", "pending", "closed"]


def test_state_and_api_limits(make_client):
    m, c = make_client(REGISTRATION_MODE="open")
    with c:
        login(c, "s@gmail.com")
        body = json.dumps({"version": 1, "attempts": [], "qstats": {}})
        codes = [c.put("/api/state", content=body, headers=ip("6.6.6.6")).status_code for _ in range(61)]
        assert codes[:60] == [200] * 60 and codes[60] == 429
        codes = [c.get("/api/config", headers={"CF-Connecting-IP": "7.7.7.7"}).status_code for _ in range(121)]
        assert codes[:120] == [200] * 120 and codes[120] == 429
        assert c.get("/healthz", headers={"CF-Connecting-IP": "7.7.7.7"}).status_code == 200  # exempt


def test_rate_limits_can_be_disabled(make_client):
    m, c = make_client(REGISTRATION_MODE="open", RATE_LIMITS_ENABLED="false")
    with c:
        assert all(login(c, "z@gmail.com").status_code == 200 for _ in range(15))


def test_token_bucket_refills(make_client, monkeypatch):
    m, _ = make_client()
    clock = [1000.0]
    monkeypatch.setattr(m.time, "monotonic", lambda: clock[0])
    lim = m.RateLimiter()
    assert all(lim.hit("login_ip", "x") == 0 for _ in range(10))
    wait = lim.hit("login_ip", "x")
    assert 100 < wait <= 120  # 30 per hour => one token every 120 s
    clock[0] += 121
    assert lim.hit("login_ip", "x") == 0
