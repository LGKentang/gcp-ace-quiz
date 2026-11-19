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

Run it locally (the page loads `data.json`, so it must be served over HTTP rather than opened from disk):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

### Features

- **Mock exam** — 50 questions / 2 hours (or a 25-question half mock), weighted by the current exam guide (~20% setup, ~30% plan & implement, ~30% operations, ~20% access & security), with a question navigator, flag-for-review and results at the end.
- **Practice** — instant feedback and explanations, filterable by domain.
- **Review mistakes** — drills every question you got wrong the last time you saw it.
- **Saved progress** — scores, history, a score trend chart and per-domain accuracy are stored in your browser (`localStorage`). Export/import a backup from the History page.

### Question banks

- **Original set** (70) — the original questions, tagged by domain, with outdated items updated for 2025–2026 product changes (Artifact Registry, Spot VMs, Cloud Run functions, etc.).
- **2026 research set** (600) — original questions written against the current (2026) exam guide, including newly added topics such as Workload/Workforce Identity Federation, Cloud NGFW policies, Agent Runtime, GPUs vs TPUs, Managed Lustre, Database Center and Gemini Cloud Assist. Background research is in [`reports/`](reports/).

---

## 💡 Contribute

Spotted a mistake? Have an improvement or suggestion?

We welcome contributions from the community! Here’s how:

- 🔍 **Report an issue** via the [Issues tab](https://github.com/yourusername/gcp-ace-practice-questions/issues)
- 📌 **Raise a pull request** to add/update a question or explanation

> Let’s make this a valuable resource for everyone preparing for GCP ACE!

---

## 📚 Tags

`gcp` `google-cloud` `cloud-certification` `gcp-ace` `ace-exam` `associate-cloud-engineer` `practice-questions` `tech-interview` `cloud-engineer`

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
