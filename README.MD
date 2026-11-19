# GCP ACE Practice Questions

This repository contains a curated collection of **practice questions** to help prepare for the **Google Cloud Associate Cloud Engineer (ACE)** certification exam.

> **Disclaimer**  
> These questions are designed for **learning and practice purposes** only. They do **not represent actual exam questions** from Google.

---

## 📘 What's Inside?

- Scenario-based multiple choice questions
- Covers key topics like compute, storage, networking, IAM, Kubernetes (GKE), and more
- Each question includes:
  - A scenario
  - A question with 4 options
  - The correct answer
  - An explanation

---

## 🚀 Getting Started

The app runs in two ways:

- **Self-hosted server (recommended)** — Google sign-in, progress saved to each user's account in SQLite, and an admin page for managing users. See [Self-hosting with Docker](#-self-hosting-with-docker--cloudflare-tunnel).
- **Static files** — no accounts; progress stays in the browser. The page loads `data.json`, so serve it over HTTP rather than opening it from disk:

  ```bash
  python3 -m http.server 8000   # then open http://localhost:8000
  ```

### Features

- **Mock exam** — 50 questions / 2 hours (or a 25-question half mock), weighted by the current exam guide (~20% setup, ~30% plan & implement, ~30% operations, ~20% access & security), with a question navigator, flag-for-review and results at the end.
- **Practice** — instant feedback and explanations, filterable by domain.
- **Review mistakes** — drills every question you got wrong the last time you saw it.
- **Saved progress** — scores, history, a score trend chart and per-domain accuracy. On the server it's saved to your account (and works across devices); in static mode it's kept in your browser. Export/import a backup from the History page.
- **Accounts & user management** (server) — Google-only sign-in, approval / open / invite-only sign-up, admin page to approve, block, promote, sign out or delete users and view their progress, plus an activity log.

### Question banks

- **Original set** (70) — the original questions, tagged by domain, with outdated items updated for 2025–2026 product changes (Artifact Registry, Spot VMs, Cloud Run functions, etc.).
- **2026 research set** (600) — original questions written against the current (2026) exam guide, including newly added topics such as Workload/Workforce Identity Federation, Cloud NGFW policies, Agent Runtime, GPUs vs TPUs, Managed Lustre, Database Center and Gemini Cloud Assist. Background research is in [`reports/`](reports/).

### Managing questions

Questions live in `data.json`. Users' progress refers to questions by `id`, so follow these rules to keep everyone's history intact:

- **Retire, don't delete.** A retired question stays in `data.json` so past results still show it (with a "Retired" label), but it never appears in a new mock, practice or mistake review.
- **Never reuse an `id`** for a different question.
- **Fixing a typo or explanation?** Keep the `id`. **Changing the options or the correct answer?** Retire the old question and add the new one with a new `id`.

```bash
python3 tools/questions.py stats                         # active / retired counts per bank and domain
python3 tools/questions.py retire  --bank research-2026  # hide the AI-written bank
python3 tools/questions.py retire  --ids 12,r26-d2-05 --reason "ambiguous"
python3 tools/questions.py restore --bank research-2026  # bring it back
```

Then redeploy (`docker compose up -d --build`). If a question is ever deleted outright, past results say how many questions can no longer be shown, and the recorded scores don't change.

---

## 🐳 Self-hosting with Docker + Cloudflare Tunnel

`docker compose` runs two containers: the app (FastAPI + SQLite, data on the `ace-data` volume) and `cloudflared`. No ports are opened on your server; traffic arrives only through the tunnel.

### 1. Create a Google OAuth client

1. In the [Google Cloud console](https://console.cloud.google.com/apis/credentials), go to **APIs & Services → Credentials → Create credentials → OAuth client ID**. Set up the OAuth consent screen first if you're asked to (External, app name, your email).
2. Application type: **Web application**.
3. **Authorized JavaScript origins**: your public URL, for example `https://ace.example.com`. No redirect URI is needed.
4. Copy the **Client ID**. The client secret isn't needed.

### 2. Create a Cloudflare Tunnel

1. In the Cloudflare dashboard, go to **Zero Trust → Networks → Tunnels → Create a tunnel → Cloudflared**, and name it.
2. Copy the token from the install command it shows (the long string after `--token`).
3. Under **Public Hostname**, add your hostname (for example `ace.example.com`) with service **HTTP** and URL **`app:8000`**.

### 3. Configure and start

```bash
cp .env.example .env
# edit .env: GOOGLE_CLIENT_ID, ADMIN_EMAILS, PUBLIC_ORIGIN, CLOUDFLARE_TUNNEL_TOKEN
docker compose up -d --build
docker compose logs -f app
```

Open your hostname and sign in with an `ADMIN_EMAILS` account. Admins see an **Admin** link in the top bar.

| Setting | What it does |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth client ID from step 1 |
| `ADMIN_EMAILS` | Comma-separated emails that are always admins (they can't be demoted from the UI) |
| `REGISTRATION_MODE` | `approval` (default: new Google accounts wait for an admin), `open`, or `invite` (only emails an admin added) |
| `ALLOWED_EMAIL_DOMAINS` | Optional allow-list of email domains, e.g. `gmail.com,mycompany.com` |
| `PUBLIC_ORIGIN` | Your public URL; cross-site API requests from other origins are rejected |
| `SESSION_DAYS` | How long a sign-in lasts (default 30) |
| `COOKIE_SECURE` | Keep `true` behind Cloudflare; `false` only for plain-HTTP local testing |
| `RATE_LIMITS_ENABLED` | Per-IP and per-user rate limits (default `true`, see below) |
| `MAX_PENDING_USERS` | New sign-ups pause once this many accounts are waiting for approval (default 200) |
| `TRUSTED_IP_HEADER` | Header holding the visitor's real IP (default `cf-connecting-ip`, set by Cloudflare). Set it empty if you publish the app port directly |
| `CLOUDFLARE_TUNNEL_TOKEN` | Token from step 2 |

### Rate limits

Limits are token buckets: you can burst up to the first number, then requests refill at the given rate. Exceeding one returns `429` with a `Retry-After` header, and the app waits that long before retrying a save.

| What | Limit |
|---|---|
| Any request, per IP | burst 300, ~10/s |
| API calls, per IP | burst 120, ~3/s |
| Sign-in attempts, per IP | 10, then 1 every 2 minutes |
| New accounts, per IP / whole site | 5 at once, 10 per day / 100 per day |
| Progress saves, per user | ~1/s (the app batches saves) |
| Question-bank downloads, per user | 20, then 60 per hour |
| Admin API, per admin | burst 60, ~2/s |

For extra protection at the edge, you can also add a Cloudflare WAF rate-limiting rule (for example on `/api/auth/*`) in the Cloudflare dashboard.

### Operations

- **Update:** `git pull && docker compose up -d --build`
- **Back up the database:** `docker compose exec app python -c "import sqlite3; sqlite3.connect('/data/ace.db').backup(sqlite3.connect('/data/backup.db'))" && docker compose cp app:/data/backup.db ./ace-backup.db`
- **Local testing without the tunnel:** uncomment the `ports` block for `app` in `docker-compose.yml`, set `COOKIE_SECURE=false` and `PUBLIC_ORIGIN=http://localhost:8000`, add `http://localhost` and `http://localhost:8000` to the OAuth client's JavaScript origins, then run `docker compose up app`.
- **Tests:** `pip install -r server/requirements.txt -r server/requirements-dev.txt && pytest server`

---

## 💡 Contribute

Spotted a mistake? Have an improvement or suggestion?

We welcome contributions from the community! Here’s how:

- 🔍 **Report an issue** via the [Issues tab](https://github.com/LGKentang/gcp-ace-quiz/issues)
- 📌 **Raise a pull request** to add/update a question or explanation

> Let’s make this a valuable resource for everyone preparing for GCP ACE!

---

## 📚 Tags

`gcp` `google-cloud` `cloud-certification` `gcp-ace` `ace-exam` `associate-cloud-engineer` `practice-questions` `tech-interview` `cloud-engineer`

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
