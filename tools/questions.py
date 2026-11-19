#!/usr/bin/env python3
"""Manage the question bank in data.json without breaking anyone's history.

Retiring a question keeps it in data.json (so past results can still show it)
but removes it from every new mock, practice and mistake review.

Usage (from the repo root):
  python3 tools/questions.py stats
  python3 tools/questions.py retire  --bank research-2026
  python3 tools/questions.py retire  --ids 12,r26-d2-05 --reason "ambiguous"
  python3 tools/questions.py restore --bank research-2026
  python3 tools/questions.py restore --ids 12

After changing data.json, redeploy:  docker compose up -d --build
Rules: never reuse an id for a different question, and give a question a new
id if you change its options or its correct answer.
"""
import argparse
import json
import sys
from collections import Counter
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data.json"


def load():
    return json.loads(DATA.read_text(encoding="utf-8"))


def save(questions):
    DATA.write_text(json.dumps(questions, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def bank(q):
    return q.get("bank", "classic")


def select(questions, args):
    if args.bank:
        chosen = [q for q in questions if bank(q) == args.bank]
        if not chosen:
            sys.exit(f"No questions in bank '{args.bank}'. Banks: {', '.join(sorted({bank(q) for q in questions}))}")
        return chosen
    ids = [i.strip() for i in args.ids.split(",") if i.strip()]
    by_id = {str(q["id"]): q for q in questions}
    unknown = [i for i in ids if i not in by_id]
    if unknown:
        sys.exit(f"Unknown question id(s): {', '.join(unknown)}")
    return [by_id[i] for i in ids]


def cmd_stats(questions, _args):
    total = Counter(bank(q) for q in questions)
    retired = Counter(bank(q) for q in questions if q.get("retired"))
    print(f"{'bank':18} {'active':>7} {'retired':>8}   by domain (active)")
    for b in sorted(total):
        active = [q for q in questions if bank(q) == b and not q.get("retired")]
        doms = Counter(q.get("domain", 0) for q in active)
        dom_txt = "  ".join(f"D{d}:{doms[d]}" for d in sorted(doms))
        print(f"{b:18} {total[b] - retired[b]:>7} {retired[b]:>8}   {dom_txt}")
    print(f"{'total':18} {len(questions) - sum(retired.values()):>7} {sum(retired.values()):>8}")


def cmd_retire(questions, args):
    changed = 0
    for q in select(questions, args):
        if not q.get("retired"):
            q["retired"] = True
            if args.reason:
                q["retiredReason"] = args.reason
            changed += 1
    save(questions)
    print(f"Retired {changed} question(s). Run 'docker compose up -d --build' to apply.")


def cmd_restore(questions, args):
    changed = 0
    for q in select(questions, args):
        if q.pop("retired", None):
            q.pop("retiredReason", None)
            changed += 1
    save(questions)
    print(f"Restored {changed} question(s). Run 'docker compose up -d --build' to apply.")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("stats", help="count active and retired questions")
    for name in ("retire", "restore"):
        sp = sub.add_parser(name, help=f"{name} questions by bank or id")
        target = sp.add_mutually_exclusive_group(required=True)
        target.add_argument("--bank", help="e.g. research-2026 or classic")
        target.add_argument("--ids", help="comma-separated question ids")
        if name == "retire":
            sp.add_argument("--reason", help="optional note stored with the question")
    args = p.parse_args()
    {"stats": cmd_stats, "retire": cmd_retire, "restore": cmd_restore}[args.cmd](load(), args)


if __name__ == "__main__":
    main()
