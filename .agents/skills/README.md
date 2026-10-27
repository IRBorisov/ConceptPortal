# Project agent skills

Skills in this folder are versioned in git. Each host loads `SKILL.md` from its configured project skills path (here: `.agents/skills/<name>/SKILL.md`).

Edit in place under `.agents/skills/<name>/`. Commit with your change.

Every skill here is also listed in the root `AGENTS.md` §«Agent skills» (one line: when to use → path), so agents whose host does not load this folder still find it. Adding a skill — add its line there too. Do not copy skill content into host-specific folders; `.claude/skills/` (Claude Code does not load this folder) holds only stubs: name, description and the path of the real skill.

User-global skills (`~/.cursor/skills-cursor/`) stay outside the repo.
