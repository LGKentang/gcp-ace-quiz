"""ACE Prep server.

Serves the quiz front end, signs users in with Google (ID-token verification),
keeps per-user progress in SQLite, and exposes a small admin API for user
management. Run with: uvicorn server.main:app
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import secrets
import sqlite3
import threading
import time
from contextlib import asynccontextmanager, closing
from pathlib import Path
from typing import Literal, Optional

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, JSONResponse
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from pydantic import BaseModel, Field

log = logging.getLogger("ace")
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))


# --------------------------------------------------------------------------
# Configuration (environment variables)
# --------------------------------------------------------------------------
def _env_list(name: str) -> set[str]:
    return {s.strip().lower() for s in os.environ.get(name, "").split(",") if s.strip()}


GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
ADMIN_EMAILS = _env_list("ADMIN_EMAILS")
ALLOWED_DOMAINS = _env_list("ALLOWED_EMAIL_DOMAINS")
REGISTRATION_MODE = os.environ.get("REGISTRATION_MODE", "approval").strip().lower()
if REGISTRATION_MODE not in {"open", "approval", "invite"}:
    raise RuntimeError("REGISTRATION_MODE must be one of: open, approval, invite")
DATABASE_PATH = os.environ.get("DATABASE_PATH", "/data/ace.db")
STATIC_DIR = Path(os.environ.get("STATIC_DIR", Path(__file__).resolve().parent.parent))
SESSION_DAYS = int(os.environ.get("SESSION_DAYS", "30"))
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").strip().lower() != "false"
PUBLIC_ORIGIN = os.environ.get("PUBLIC_ORIGIN", "").strip().rstrip("/")

RATE_LIMITS_ENABLED = os.environ.get("RATE_LIMITS_ENABLED", "true").strip().lower() != "false"
# Header holding the real visitor IP. cloudflared sets CF-Connecting-IP. Only trust it
# when the app is reachable solely through the tunnel; set to "" if you expose the port.
TRUSTED_IP_HEADER = os.environ.get("TRUSTED_IP_HEADER", "cf-connecting-ip").strip().lower()
# Hard cap on accounts waiting for approval, so sign-up spam can't fill the database.
MAX_PENDING_USERS = int(os.environ.get("MAX_PENDING_USERS", "200"))

COOKIE_NAME = "ace_session"
MAX_STATE_BYTES = 2_000_000
PUBLIC_FILES = {"index.html", "script.js", "style.css", "theme.js", "favicon.svg"}
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

_google_request = google_requests.Request()


# --------------------------------------------------------------------------
# Rate limiting
# --------------------------------------------------------------------------
# Token buckets: (burst, refill_amount, refill_period_seconds). A bucket starts
# full; each request takes one token; tokens come back at amount/period per second.
# Limits are sized well above what a real person studying would ever hit.
RATE_RULES: dict[str, tuple[int, int, int]] = {
    "all_ip":         (300, 600, 60),     # every request, per IP: bursts of 300, ~10/s sustained
    "api_ip":         (120, 180, 60),     # API calls, per IP: ~3/s sustained
    "login_ip":       (10, 30, 3600),     # sign-in attempts, per IP: 10 quickly, then 1 every 2 min
    "register_ip":    (5, 10, 86400),     # new accounts, per IP: 5 at once, 10/day
    "register_all":   (50, 100, 86400),   # new accounts, whole site: 100/day
    "state_user":     (60, 60, 60),       # progress saves, per user: ~1/s (client batches saves)
    "questions_user": (20, 60, 3600),     # question-bank downloads (780 KB), per user
    "admin_user":     (60, 120, 60),      # admin API calls, per admin: ~2/s
}


class RateLimited(HTTPException):
    def __init__(self, retry_after: float, message: str = "Too many requests."):
        wait = max(1, int(retry_after + 0.999))
        when = f"{wait} seconds" if wait < 90 else f"{round(wait / 60)} minutes" if wait < 5400 else f"{round(wait / 3600)} hours"
        super().__init__(429, f"{message} Please try again in {when}.", headers={"Retry-After": str(wait)})


class RateLimiter:
    """In-memory token buckets. The app runs as one process, so counts are exact."""

    def __init__(self) -> None:
        self._buckets: dict[tuple[str, str], tuple[float, float]] = {}
        self._lock = threading.Lock()
        self._last_prune = time.monotonic()

    def hit(self, rule: str, key: str) -> float:
        """Take one token. Returns 0 if allowed, else the seconds until a token is free."""
        if not RATE_LIMITS_ENABLED:
            return 0.0
        burst, amount, period = RATE_RULES[rule]
        rate = amount / period
        t = time.monotonic()
        with self._lock:
            tokens, last = self._buckets.get((rule, key), (float(burst), t))
            tokens = min(float(burst), tokens + (t - last) * rate)
            if tokens >= 1:
                self._buckets[(rule, key)] = (tokens - 1, t)
                wait = 0.0
            else:
                self._buckets[(rule, key)] = (tokens, t)
                wait = (1 - tokens) / rate
            if t - self._last_prune > 300 or len(self._buckets) > 50_000:
                self._prune(t)
        return wait

    def check(self, rule: str, key: str, message: str = "Too many requests.") -> None:
        wait = self.hit(rule, key)
        if wait:
            log.warning("Rate limited: rule=%s key=%s wait=%.0fs", rule, key, wait)
            raise RateLimited(wait, message)

    def _prune(self, t: float) -> None:
        # Forget buckets that have refilled completely; they'd start full anyway.
        for k, (tokens, last) in list(self._buckets.items()):
            burst, amount, period = RATE_RULES[k[0]]
            if tokens + (t - last) * amount / period >= burst:
                del self._buckets[k]
        self._last_prune = t


limiter = RateLimiter()


def client_ip(request: Request) -> str:
    if TRUSTED_IP_HEADER:
        ip = request.headers.get(TRUSTED_IP_HEADER, "").strip()
        if ip:
            return ip
    return request.client.host if request.client else "unknown"


# --------------------------------------------------------------------------
# Database
# --------------------------------------------------------------------------
SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  google_sub    TEXT UNIQUE,
  name          TEXT,
  picture       TEXT,
  role          TEXT NOT NULL DEFAULT 'user'    CHECK (role IN ('user', 'admin')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
  created_at    INTEGER NOT NULL,
  last_login_at INTEGER,
  last_seen_at  INTEGER
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  user_agent  TEXT
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS user_state (
  user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  state       TEXT NOT NULL,
  updated_at  INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_log (
  id           INTEGER PRIMARY KEY,
  at           INTEGER NOT NULL,
  actor_email  TEXT,
  action       TEXT NOT NULL,
  target_email TEXT,
  detail       TEXT
);
"""


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH, timeout=15, check_same_thread=False)  # one connection per request
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 15000")
    return conn


def init_db() -> None:
    Path(DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)
    with closing(connect()) as conn:
        conn.execute("PRAGMA journal_mode = WAL")
        conn.executescript(SCHEMA)
        conn.execute("DELETE FROM sessions WHERE expires_at < ?", (now(),))
        conn.commit()


def get_db():
    conn = connect()
    try:
        yield conn
        conn.commit()
    except BaseException:
        conn.rollback()
        raise
    finally:
        conn.close()


def now() -> int:
    return int(time.time())


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def audit(conn, actor_email: Optional[str], action: str, target_email: Optional[str] = None, detail: str = "") -> None:
    conn.execute(
        "INSERT INTO audit_log (at, actor_email, action, target_email, detail) VALUES (?, ?, ?, ?, ?)",
        (now(), actor_email, action, target_email, detail),
    )


def public_user(row) -> dict:
    return {
        "id": row["id"],
        "email": row["email"],
        "name": row["name"],
        "picture": row["picture"],
        "role": row["role"],
        "status": row["status"],
        "isBootstrapAdmin": row["email"].lower() in ADMIN_EMAILS,
    }


# --------------------------------------------------------------------------
# App, middleware and auth dependencies
# --------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    if not GOOGLE_CLIENT_ID:
        log.warning("GOOGLE_CLIENT_ID is not set; Google sign-in will not work.")
    if not ADMIN_EMAILS:
        log.warning("ADMIN_EMAILS is not set; nobody will be able to manage users.")
    log.info("Registration mode: %s", REGISTRATION_MODE)
    yield


app = FastAPI(title="ACE Prep", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)


CSP = "; ".join([
    "default-src 'self'",
    "script-src 'self' https://accounts.google.com/gsi/client",
    "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
    "frame-src https://accounts.google.com/gsi/",
    "connect-src 'self' https://accounts.google.com/gsi/",
    "img-src 'self' data: https://*.googleusercontent.com",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
])


@app.middleware("http")
async def security(request: Request, call_next):
    # Per-IP limits on every request (health checks exempt), tighter for the API.
    path = request.url.path
    if path != "/healthz":
        ip = client_ip(request)
        for rule in ("all_ip", "api_ip") if path.startswith("/api/") else ("all_ip",):
            wait = limiter.hit(rule, ip)
            if wait:
                log.warning("Rate limited: rule=%s ip=%s path=%s", rule, ip, path)
                err = RateLimited(wait, "Too many requests from your network.")
                return JSONResponse({"detail": err.detail}, status_code=429, headers=err.headers)

    # CSRF defence for state-changing API calls: SameSite=Lax cookie + a custom
    # header that cross-site forms cannot send + an Origin check when configured.
    if request.url.path.startswith("/api/") and request.method not in {"GET", "HEAD", "OPTIONS"}:
        if request.headers.get("x-requested-with") != "fetch":
            return JSONResponse({"detail": "Missing X-Requested-With header"}, status_code=403)
        origin = request.headers.get("origin")
        if PUBLIC_ORIGIN and origin and origin.rstrip("/") != PUBLIC_ORIGIN:
            return JSONResponse({"detail": "Cross-origin request blocked"}, status_code=403)
    response = await call_next(request)
    response.headers.setdefault("Content-Security-Policy", CSP)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
    if request.url.path.startswith("/api/"):
        response.headers.setdefault("Cache-Control", "no-store")
    return response


def optional_user(request: Request, conn: sqlite3.Connection = Depends(get_db)):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    row = conn.execute(
        "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token_hash = ? AND s.expires_at > ?",
        (hash_token(token), now()),
    ).fetchone()
    if not row or row["status"] != "active":
        return None
    if (row["last_seen_at"] or 0) < now() - 300:
        conn.execute("UPDATE users SET last_seen_at = ? WHERE id = ?", (now(), row["id"]))
    return row


def require_user(user=Depends(optional_user)):
    if user is None:
        raise HTTPException(401, "Not signed in")
    return user


def require_admin(user=Depends(require_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admins only")
    limiter.check("admin_user", str(user["id"]), "Too many admin requests.")
    return user


# --------------------------------------------------------------------------
# Public endpoints
# --------------------------------------------------------------------------
@app.get("/healthz")
def healthz():
    with closing(connect()) as conn:
        conn.execute("SELECT 1")
    return {"ok": True}


@app.get("/api/config")
def config():
    return {"mode": "server", "googleClientId": GOOGLE_CLIENT_ID, "registrationMode": REGISTRATION_MODE}


class GoogleLogin(BaseModel):
    credential: str = Field(min_length=20, max_length=8000)


def _denied(status: str, message: str, email: str) -> JSONResponse:
    return JSONResponse({"detail": message, "status": status, "email": email}, status_code=403)


@app.post("/api/auth/google")
def login_google(body: GoogleLogin, request: Request, response: Response, conn: sqlite3.Connection = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(500, "Google sign-in is not configured on the server (GOOGLE_CLIENT_ID).")
    ip = client_ip(request)
    limiter.check("login_ip", ip, "Too many sign-in attempts.")
    try:
        info = google_id_token.verify_oauth2_token(body.credential, _google_request, GOOGLE_CLIENT_ID)
    except ValueError as exc:
        log.info("Rejected Google token: %s", exc)
        raise HTTPException(401, "Google sign-in could not be verified. Please try again.")
    if info.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        raise HTTPException(401, "Unexpected token issuer.")
    if not info.get("email") or not info.get("email_verified"):
        raise HTTPException(401, "Your Google account email is not verified.")

    email = info["email"].lower()
    sub = str(info["sub"])
    name = (info.get("name") or email.split("@")[0])[:200]
    picture = info.get("picture") if str(info.get("picture", "")).startswith("https://") else None
    bootstrap_admin = email in ADMIN_EMAILS

    if ALLOWED_DOMAINS and email.split("@")[-1] not in ALLOWED_DOMAINS and not bootstrap_admin:
        audit(conn, email, "login.rejected_domain", email)
        return _denied("domain", "This app only accepts Google accounts from: " + ", ".join(sorted(ALLOWED_DOMAINS)), email)

    user = conn.execute("SELECT * FROM users WHERE google_sub = ?", (sub,)).fetchone() \
        or conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if user is None:
        if REGISTRATION_MODE == "invite" and not bootstrap_admin:
            audit(conn, email, "login.not_invited", email)
            return _denied("not_invited", "This app is invite-only. Ask an admin to add your email address.", email)
        status = "active" if (REGISTRATION_MODE == "open" or bootstrap_admin) else "pending"
        role = "admin" if bootstrap_admin else "user"
        if not bootstrap_admin:
            if status == "pending":
                waiting = conn.execute("SELECT COUNT(*) FROM users WHERE status = 'pending'").fetchone()[0]
                if waiting >= MAX_PENDING_USERS:
                    log.warning("Sign-up refused: %d accounts already pending", waiting)
                    return _denied("closed", "New sign-ups are paused right now. Please try again later.", email)
            limiter.check("register_ip", ip, "Too many new accounts from your network.")
            limiter.check("register_all", "site", "New sign-ups are busy right now.")
        cur = conn.execute(
            "INSERT INTO users (email, google_sub, name, picture, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (email, sub, name, picture, role, status, now()),
        )
        user_id = cur.lastrowid
        audit(conn, email, "user.registered", email, f"status={status} role={role}")
    else:
        user_id = user["id"]
        if user["google_sub"] and user["google_sub"] != sub:
            audit(conn, email, "login.sub_mismatch", email)
            raise HTTPException(401, "This email is linked to a different Google account.")
        conn.execute(
            "UPDATE users SET google_sub = ?, email = ?, name = ?, picture = ? WHERE id = ?",
            (sub, email, name, picture, user_id),
        )
        if bootstrap_admin and (user["role"] != "admin" or user["status"] != "active"):
            conn.execute("UPDATE users SET role = 'admin', status = 'active' WHERE id = ?", (user_id,))
            audit(conn, email, "user.bootstrap_admin", email)

    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if user["status"] == "pending":
        return _denied("pending", "Your account is waiting for an admin to approve it.", email)
    if user["status"] == "blocked":
        return _denied("blocked", "This account has been blocked. Contact an admin if you think this is a mistake.", email)

    token = secrets.token_urlsafe(32)
    conn.execute(
        "INSERT INTO sessions (token_hash, user_id, created_at, expires_at, user_agent) VALUES (?, ?, ?, ?, ?)",
        (hash_token(token), user_id, now(), now() + SESSION_DAYS * 86400, request.headers.get("user-agent", "")[:300]),
    )
    conn.execute("UPDATE users SET last_login_at = ?, last_seen_at = ? WHERE id = ?", (now(), now(), user_id))
    response.set_cookie(
        COOKIE_NAME, token, max_age=SESSION_DAYS * 86400, httponly=True,
        secure=COOKIE_SECURE, samesite="lax", path="/",
    )
    return {"user": public_user(user)}


@app.post("/api/auth/logout")
def logout(request: Request, response: Response, conn: sqlite3.Connection = Depends(get_db)):
    token = request.cookies.get(COOKIE_NAME)
    if token:
        conn.execute("DELETE FROM sessions WHERE token_hash = ?", (hash_token(token),))
    response.delete_cookie(COOKIE_NAME, path="/", secure=COOKIE_SECURE, httponly=True, samesite="lax")
    return {"ok": True}


@app.get("/api/me")
def me(user=Depends(require_user)):
    return {"user": public_user(user)}


# --------------------------------------------------------------------------
# Per-user progress
# --------------------------------------------------------------------------
@app.get("/api/state")
def get_state(user=Depends(require_user), conn: sqlite3.Connection = Depends(get_db)):
    row = conn.execute("SELECT state, updated_at FROM user_state WHERE user_id = ?", (user["id"],)).fetchone()
    if not row:
        return {"state": None, "updatedAt": None}
    return {"state": json.loads(row["state"]), "updatedAt": row["updated_at"]}


@app.put("/api/state")
async def put_state(request: Request, user=Depends(require_user), conn: sqlite3.Connection = Depends(get_db)):
    limiter.check("state_user", str(user["id"]), "Saving too often.")
    raw = await request.body()
    if len(raw) > MAX_STATE_BYTES:
        raise HTTPException(413, "Progress data is too large.")
    try:
        state = json.loads(raw)
    except ValueError:
        raise HTTPException(400, "Body must be JSON.")
    if not isinstance(state, dict) or state.get("version") != 1 \
            or not isinstance(state.get("attempts"), list) or not isinstance(state.get("qstats"), dict):
        raise HTTPException(400, "Not a valid ACE Prep progress object.")
    ts = now()
    conn.execute(
        "INSERT INTO user_state (user_id, state, updated_at) VALUES (?, ?, ?) "
        "ON CONFLICT(user_id) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at",
        (user["id"], json.dumps(state, separators=(",", ":")), ts),
    )
    return {"ok": True, "updatedAt": ts}


# --------------------------------------------------------------------------
# Admin: user management
# --------------------------------------------------------------------------
def summarize(state_json: Optional[str]) -> dict:
    empty = {"sessions": 0, "mocks": 0, "bestMock": None, "avgLast5": None,
             "answered": 0, "accuracy": None, "lastActivity": None}
    if not state_json:
        return empty
    try:
        attempts = [a for a in json.loads(state_json).get("attempts", []) if isinstance(a, dict)]
        mocks = [a for a in attempts if a.get("mode") == "mock"]
        answered = sum(int(a.get("total") or 0) for a in attempts)
        correct = sum(int(a.get("correct") or 0) for a in attempts)
        last5 = [float(a.get("pct") or 0) for a in mocks[-5:]]
        return {
            "sessions": len(attempts),
            "mocks": len(mocks),
            "bestMock": max((a.get("pct") or 0 for a in mocks), default=None),
            "avgLast5": round(sum(last5) / len(last5)) if last5 else None,
            "answered": answered,
            "accuracy": round(correct * 100 / answered) if answered else None,
            "lastActivity": max((int(a.get("finishedAt") or 0) for a in attempts), default=None),
        }
    except (ValueError, TypeError, AttributeError):
        return empty


def _get_target(conn, user_id: int):
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(404, "User not found.")
    return row


def _active_admins(conn) -> int:
    return conn.execute("SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active'").fetchone()[0]


@app.get("/api/admin/users")
def admin_list_users(admin=Depends(require_admin), conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT u.*, s.state, (SELECT COUNT(*) FROM sessions x WHERE x.user_id = u.id AND x.expires_at > ?) AS session_count "
        "FROM users u LEFT JOIN user_state s ON s.user_id = u.id ORDER BY u.status = 'pending' DESC, u.created_at DESC",
        (now(),),
    ).fetchall()
    users = []
    for r in rows:
        u = public_user(r)
        u.update({
            "createdAt": r["created_at"], "lastLoginAt": r["last_login_at"], "lastSeenAt": r["last_seen_at"],
            "activeSessions": r["session_count"], "neverSignedIn": r["google_sub"] is None,
            "stats": summarize(r["state"]),
        })
        users.append(u)
    return {"users": users, "registrationMode": REGISTRATION_MODE, "allowedDomains": sorted(ALLOWED_DOMAINS)}


class NewUser(BaseModel):
    email: str = Field(max_length=320)
    role: Literal["user", "admin"] = "user"


@app.post("/api/admin/users")
def admin_add_user(body: NewUser, admin=Depends(require_admin), conn: sqlite3.Connection = Depends(get_db)):
    email = body.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(400, "Enter a valid email address.")
    existing = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        if existing["status"] == "active" and existing["role"] == body.role:
            raise HTTPException(409, "That user already has access.")
        conn.execute("UPDATE users SET status = 'active', role = ? WHERE id = ?", (body.role, existing["id"]))
        audit(conn, admin["email"], "user.approved", email, f"role={body.role}")
    else:
        conn.execute(
            "INSERT INTO users (email, role, status, created_at) VALUES (?, ?, 'active', ?)",
            (email, body.role, now()),
        )
        audit(conn, admin["email"], "user.invited", email, f"role={body.role}")
    return {"ok": True}


class UserUpdate(BaseModel):
    role: Optional[Literal["user", "admin"]] = None
    status: Optional[Literal["pending", "active", "blocked"]] = None


@app.patch("/api/admin/users/{user_id}")
def admin_update_user(user_id: int, body: UserUpdate, admin=Depends(require_admin), conn: sqlite3.Connection = Depends(get_db)):
    target = _get_target(conn, user_id)
    if target["id"] == admin["id"]:
        raise HTTPException(400, "You can't change your own role or status.")
    if target["email"].lower() in ADMIN_EMAILS:
        raise HTTPException(400, "This admin is set by ADMIN_EMAILS on the server. Remove them there first.")
    new_role = body.role or target["role"]
    new_status = body.status or target["status"]
    if target["role"] == "admin" and target["status"] == "active" \
            and (new_role != "admin" or new_status != "active") and _active_admins(conn) <= 1:
        raise HTTPException(400, "You can't remove the last active admin.")
    conn.execute("UPDATE users SET role = ?, status = ? WHERE id = ?", (new_role, new_status, user_id))
    if new_status != "active":
        conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
    changes = []
    if new_role != target["role"]:
        changes.append(f"role {target['role']}→{new_role}")
    if new_status != target["status"]:
        changes.append(f"status {target['status']}→{new_status}")
    if changes:
        audit(conn, admin["email"], "user.updated", target["email"], ", ".join(changes))
    return {"ok": True}


@app.delete("/api/admin/users/{user_id}/sessions")
def admin_revoke_sessions(user_id: int, admin=Depends(require_admin), conn: sqlite3.Connection = Depends(get_db)):
    target = _get_target(conn, user_id)
    n = conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,)).rowcount
    audit(conn, admin["email"], "user.signed_out", target["email"], f"{n} session(s)")
    return {"ok": True, "revoked": n}


@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: int, admin=Depends(require_admin), conn: sqlite3.Connection = Depends(get_db)):
    target = _get_target(conn, user_id)
    if target["id"] == admin["id"]:
        raise HTTPException(400, "You can't delete your own account.")
    if target["email"].lower() in ADMIN_EMAILS:
        raise HTTPException(400, "This admin is set by ADMIN_EMAILS on the server. Remove them there first.")
    if target["role"] == "admin" and target["status"] == "active" and _active_admins(conn) <= 1:
        raise HTTPException(400, "You can't delete the last active admin.")
    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    audit(conn, admin["email"], "user.deleted", target["email"])
    return {"ok": True}


@app.get("/api/admin/users/{user_id}/state")
def admin_user_state(user_id: int, admin=Depends(require_admin), conn: sqlite3.Connection = Depends(get_db)):
    target = _get_target(conn, user_id)
    row = conn.execute("SELECT state, updated_at FROM user_state WHERE user_id = ?", (user_id,)).fetchone()
    return {
        "user": public_user(target),
        "state": json.loads(row["state"]) if row else None,
        "updatedAt": row["updated_at"] if row else None,
    }


@app.get("/api/admin/audit")
def admin_audit(limit: int = 100, admin=Depends(require_admin), conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT at, actor_email, action, target_email, detail FROM audit_log ORDER BY id DESC LIMIT ?",
        (max(1, min(limit, 500)),),
    ).fetchall()
    return {"entries": [dict(r) for r in rows]}


# --------------------------------------------------------------------------
# Static front end (questions are only served to signed-in users)
# --------------------------------------------------------------------------
@app.get("/data.json")
def questions(user=Depends(require_user)):
    limiter.check("questions_user", str(user["id"]), "Too many downloads of the question bank.")
    return FileResponse(STATIC_DIR / "data.json", media_type="application/json",
                        headers={"Cache-Control": "private, no-cache"})


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html", headers={"Cache-Control": "no-cache"})


@app.get("/{name}")
def static_file(name: str):
    if name not in PUBLIC_FILES or not (STATIC_DIR / name).is_file():
        raise HTTPException(404, "Not found")
    return FileResponse(STATIC_DIR / name, headers={"Cache-Control": "no-cache"})
