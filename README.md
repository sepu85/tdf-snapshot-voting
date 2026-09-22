# TDF Snapshot Voting — an interim, independently-verifiable voting option

TDF's DAO governance currently runs on the [Closer](https://github.com/closerdao/closer-ui) platform. A close look at how votes are recorded and verified there found that the system is **tamper-evident but not independently auditable**: it can prove a published result wasn't edited after the fact, but it can't prove the result was tallied honestly in the first place, because Closer's backend alone controls voter eligibility, weight, tallying, and publication — with no outside check. Full findings: see [`tdf-governance-weight`](https://github.com/sepu85/tdf-governance-weight) and the community report it links.

This matters more than usual for TDF because **the same admin who operates Closer is also a TDF citizen with strong agency in the DAO** — a structural conflict of interest, whether or not it's ever been acted on.

This repo gives the TDF community **three independent options**, so nobody has to wait on any one of them:

| Option | What it is | Where |
|---|---|---|
| **A — Fix Closer** | A phased plan to make Closer's own voting cryptographically verifiable, submitted as an RFC to `closerdao/closer-ui` and a companion TDF governance proposal. | [`RFC-DRAFT.md`](./RFC-DRAFT.md), [`TDF-PROPOSAL-DRAFT.md`](./TDF-PROPOSAL-DRAFT.md), [`phase1-closer-ui-patch.md`](./phase1-closer-ui-patch.md) |
| **B — Vote on Snapshot in the meantime** | A documented, ready-to-use way to replicate TDF's exact voting-weight formula on [Snapshot.org](https://snapshot.org), usable in parallel with Closer today, with no code changes needed anywhere. | [`FORMULA.md`](./FORMULA.md), [`snapshot-space-config.md`](./snapshot-space-config.md), [`SETUP.md`](./SETUP.md), [`verify.mjs`](./verify.mjs) |
| **C — Social audit process** | A no-code, human-process check: a rotating, elected panel of community members independently verifies each result. Works regardless of which other option is chosen. | [`SOCIAL-AUDIT.md`](./SOCIAL-AUDIT.md) |

## Scope and honesty notes

- **This repo does not unilaterally change how TDF governance works.** Option B is a *parallel, opt-in* tool — using it for anything binding is a decision the TDF community should make explicitly, ideally after running it in shadow mode alongside a real Closer vote and comparing results.
- **Snapshot is not perfectly trustless either** — it's a hosted, third-party-run service. It is, however, far more widely used, audited, and multi-tenant than a single company's private backend, and (unlike Closer today) it signs every individual vote with the voter's own wallet and stores it publicly.
- Everything here is written to be checked, not taken on faith — every claim about contract addresses, formulas, and Snapshot's own strategy behavior is sourced and can be independently re-verified (see [`FORMULA.md`](./FORMULA.md) and [`verify.mjs`](./verify.mjs)).

## Status

Draft, for community review. Nothing here has been adopted as official TDF process yet.
