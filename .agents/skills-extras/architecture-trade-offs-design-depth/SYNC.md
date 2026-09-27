# A–E dual-source sync

**Writer:** `DevEnvTemplate/.agents/skills-extras/architecture-trade-offs-design-depth/SKILL.md`  
**Canon blob:** `107a5118c95c1bf0b1b3d1755796632bff41b535` (`git hash-object` of `SKILL.md`)  
**Copies (byte-identical; no second body):** HomeWorld `.agents/skills-extras/architecture-trade-offs-design-depth/SKILL.md` · Co Grok skill `architecture-trade-offs-design-depth`

## Checklist
1. Edit **writer** on DET only.
2. `git hash-object SKILL.md` → update **Canon blob** above.
3. Copy `SKILL.md` bytes unchanged → HW **extras** path (same blob).
4. Refresh Co skill from writer bytes (no paraphrase).
5. Keep lean extras `architecture-tradeoffs` / `design-complexity` as optional A/B subsets — not a fork; do not load with full A–E.
6. Never paste A–E body into `AGENTS.md` (pointer row only).
7. Verify DET blob == HW blob == Canon.
8. Stop — no pin bump in this checklist.


## Fitness greps (blob equality — CO_BOTS_PROCESS_REFINE bite 5)

From a checkout that has both repos (or via `gh api` + `git hash-object` on downloaded bytes):

```bash
# 1) DET writer
git -C DevEnvTemplate hash-object .agents/skills-extras/architecture-trade-offs-design-depth/SKILL.md
# expect: 107a5118c95c1bf0b1b3d1755796632bff41b535   (or updated Canon blob with Lead ack)

# 2) HW extras copy on current main (example tip — replace ref as needed)
git rev-parse HEAD:.agents/skills-extras/architecture-trade-offs-design-depth/SKILL.md
# blob OID must equal Canon

# 3) Three-way: DET hash-object == HW blob OID == Canon line above
```

If unequal: copy writer → HW extras → refresh Co skill; update Canon line; **do not** edit copy bodies independently. No pin bump in this checklist. A–E `SKILL.md` body must stay unchanged by fitness-doc-only bites.
