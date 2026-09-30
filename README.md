# TDF Snapshot Voting — an interim, independently-verifiable voting option

TDF's DAO governance currently runs on the [Closer](https://github.com/closerdao/closer-ui) platform. A close look at how votes are recorded and verified there found that the system is **tamper-evident but not independently auditable**: it can prove a published result wasn't edited after the fact, but it can't prove the result was tallied honestly in the first place, because Closer's backend alone controls voter eligibility, weight, tallying, and publication — with no outside check. Full findings: see [`tdf-governance-weight`](https://github.com/sepu85/tdf-governance-weight) and the community report it links.

This matters more than usual for TDF because **the same admin who operates Closer is also a TDF citizen with strong agency in the DAO** — a structural conflict of interest, whether or not it's ever been acted on.

This repo gives the TDF community **three complementary tracks**, bundled into one proposal so nobody has to wait on any one of them — see [`PROPOSAL.md`](./PROPOSAL.md), written for a non-technical DAO in TDF's own What/Why/Impact/Resources/How template:

| Track | What it is | Where |
|---|---|---|
| **1 — Fix Closer** | A phased plan to make Closer's own voting cryptographically verifiable: structured, wallet-signed vote receipts published to IPFS. Phase 1 needed zero closer-api cooperation — it's open now as [closerdao/closer-ui#1179](https://github.com/closerdao/closer-ui/pull/1179), referencing the RFC at [closerdao/closer-ui#1178](https://github.com/closerdao/closer-ui/issues/1178). | [`RFC-DRAFT.md`](./RFC-DRAFT.md), [`ipfs-design.md`](./ipfs-design.md), [`phase1-closer-ui-patch.md`](./phase1-closer-ui-patch.md) |
| **2 — Vote on Snapshot in the meantime** | TDF already has a real, historically-used Snapshot space that's sat inactive since Dec 2024 — reactivating and properly configuring it (rather than starting over) is the documented path, with a new-space fallback if reactivation isn't possible. | [`EXISTING-SNAPSHOT-SPACE.md`](./EXISTING-SNAPSHOT-SPACE.md), [`FORMULA.md`](./FORMULA.md), [`snapshot-space-config.md`](./snapshot-space-config.md), [`SETUP.md`](./SETUP.md), [`verify.mjs`](./verify.mjs) |
| **3 — A simple after-the-vote receipt** | The smallest ask: publish enough after each vote that any citizen can check their own vote was counted correctly, no crypto knowledge required. Doesn't close the whole trust gap on its own, but costs little and helps immediately. | [`PROPOSAL.md`](./PROPOSAL.md) |

An earlier, more informal write-up of this same page for a general audience — three separate options, not a bundled ask — is at [Show Your Work](https://claude.ai/artifact/EC4f7mw7yd2dGzYZuXjiW7). `PROPOSAL.md` is the one meant for actual submission.

## Scope and honesty notes

- **This repo does not unilaterally change how TDF governance works.** Track 2 (Snapshot) is a *parallel, opt-in* tool — using it for anything binding is a decision the TDF community should make explicitly, ideally after running it in shadow mode alongside a real Closer vote and comparing results.
- **Snapshot is not perfectly trustless either** — it's a hosted, third-party-run service. It is, however, far more widely used, audited, and multi-tenant than a single company's private backend, and (unlike Closer today) it signs every individual vote with the voter's own wallet and stores it publicly.
- Everything here is written to be checked, not taken on faith — every claim about contract addresses, formulas, and Snapshot's own strategy behavior is sourced and can be independently re-verified (see [`FORMULA.md`](./FORMULA.md) and [`verify.mjs`](./verify.mjs)).
- A fourth idea, not part of the current bundled proposal, is still documented in case it's useful later: [`SOCIAL-AUDIT.md`](./SOCIAL-AUDIT.md), a rotating community panel that independently checks results by hand, with no platform cooperation needed at all.

## Status

Track 1's first phase is live as an open PR under review by Closer's maintainers ([#1179](https://github.com/closerdao/closer-ui/pull/1179)). Everything else — the Snapshot reactivation, the receipt ask, and Phase 2+ of Track 1 — is still draft, for community review. `PROPOSAL.md` is the version meant for actual submission; nothing here has been adopted as official TDF process yet, and the PR being open doesn't mean it's merged or that IPFS publishing is live in production.
