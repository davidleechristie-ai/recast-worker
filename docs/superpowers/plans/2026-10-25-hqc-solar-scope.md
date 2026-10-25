# HQC Solar Scope Implementation Plan
> For agentic workers: use superpowers:executing-plans inline, one independent whole-change review.
Goal: improve existing solar/battery scope guidance.
Architecture: static article addition; existing GitHub/Cloudflare release.
Tech Stack: HTML/CSS, existing Node/Playwright checks.
Spec: docs/superpowers/specs/2026-10-25-hqc-solar-scope-design.md
Global constraints: no new URL, data collection, price/payment change, unsupported sizing or savings.
Review focus: battery-only applicability; energy versus power; source attribution; mobile/print readability; free CTA routing.
Task1:
- [x] Inspect writers/existing pages and verify primary sources.
- [x] Confirm baseline has no solar-battery-scope record; implement four-question scope aid in how-we-help.html.
- [x] Extend existing rendered checks for320/390/1440, no overflow/form, print visibility and routed QA link.
- [ ] Run existing PR gates, independent review and inspect rendered artifact.
- [ ] Merge under existing authority after gates; verify production receipt and public content; persist experiment with exact comment readback.
Ruling: remote isolated branch used with connector because no synced local checkout; no new infrastructure. Noninteractive owner authority supersedes design/plan questions. No shared interfaces with other writers.
