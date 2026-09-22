# TDF Snapshot Voting — an interim, independently-verifiable voting option

TDF's DAO governance currently runs on the [Closer](https://github.com/closerdao/closer-ui) platform. A close look at how votes are recorded and verified there found that the system is **tamper-evident but not independently auditable**: it can prove a published result wasn't edited after the fact, but it can't prove the result was tallied honestly in the first place, because Closer's backend alone controls voter eligibility, weight, tallying, and publication — with no outside check. Full findings: see [`tdf-governance-weight`](https://github.com/sepu85/tdf-governance-weight) and the community report it links.

This matters more than usual for TDF because **the same admin who operates Closer is also a TDF citizen with strong agency in the DAO** — a structural conflict of interest, whether or not it's ever been acted on.

This repo gives the TDF community **three independent options**, so nobody has to wait on any one of them:

| Option | What it is | Where |
|---|---|---|
| **A — Fix Closer** | A phased plan to make Closer's own voting cryptographically verifiable: structured, wallet-signed vote receipts published to IPFS. Phase 1 needed zero closer-api cooperation — it's open now as [closerdao/closer-ui#1179](https://github.com/closerdao/closer-ui/pull/1179), referencing the RFC at [closerdao/closer-ui#1178](https://github.com/closerdao/closer-ui/issues/1178). | [`RFC-DRAFT.md`](./RFC-DRAFT.md), [`ipfs-design.md`](./ipfs-design.md), [`phase1-closer-ui-patch.md`](./phase1-closer-ui-patch.md), [`TDF-PROPOSAL-DRAFT.md`](./TDF-PROPOSAL-DRAFT.md) |
| **B — Vote on Snapshot in the meantime** | TDF already has a real, historically-used Snapshot space that's sat inactive since Dec 2024 — reactivating and properly configuring it (rather than starting over) is the documented path, with a new-space fallback if reactivation isn't possible. | [`EXISTING-SNAPSHOT-SPACE.md`](./EXISTING-SNAPSHOT-SPACE.md), [`FORMULA.md`](./FORMULA.md), [`snapshot-space-config.md`](./snapshot-space-config.md), [`SETUP.md`](./SETUP.md), [`verify.mjs`](./verify.mjs) |
| **C — Social audit process** | A no-code, human-process check: a rotating, elected panel of community members independently verifies each result. Works regardless of which other option is chosen. | [`SOCIAL-AUDIT.md`](./SOCIAL-AUDIT.md) |

## Scope and honesty notes

- **This repo does not unilaterally change how TDF governance works.** Option B is a *parallel, opt-in* tool — using it for anything binding is a decision the TDF community should make explicitly, ideally after running it in shadow mode alongside a real Closer vote and comparing results.
- **Snapshot is not perfectly trustless either** — it's a hosted, third-party-run service. It is, however, far more widely used, audited, and multi-tenant than a single company's private backend, and (unlike Closer today) it signs every individual vote with the voter's own wallet and stores it publicly.
- Everything here is written to be checked, not taken on faith — every claim about contract addresses, formulas, and Snapshot's own strategy behavior is sourced and can be independently re-verified (see [`FORMULA.md`](./FORMULA.md) and [`verify.mjs`](./verify.mjs)).

## Status

Option A's Phase 1 is live as an open PR under review by Closer's maintainers ([#1179](https://github.com/closerdao/closer-ui/pull/1179)). Everything else — Option B's space reactivation, Option C, and Phase 2+ of Option A — is still draft, for community review. Nothing here has been adopted as official TDF process yet; the PR being open doesn't mean it's merged or that IPFS publishing is live in production.
