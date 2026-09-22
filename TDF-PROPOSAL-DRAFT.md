# TDF governance proposal (draft): mandate for verifiable voting

> **Status:** draft, not yet submitted. The technical RFC is live at [closerdao/closer-ui#1178](https://github.com/closerdao/closer-ui/issues/1178), with its Phase 1 already open as [closerdao/closer-ui#1179](https://github.com/closerdao/closer-ui/pull/1179). Written to be posted through TDF's normal proposal process once that thread has had initial engagement. Edit freely before submitting — this is a starting point, not a final text.

## Title

Mandate: make TDF governance voting independently verifiable

## Context

An analysis of how TDF's governance votes are recorded and verified found the current system to be **tamper-evident but not independently auditable**: it can prove a published result wasn't edited after the fact, but not that it was accurate when published, because Closer's backend alone controls voter eligibility, weight, tallying, and publication — with no outside check.

This matters specifically because **the same admin who operates the Closer platform is also a TDF citizen with strong agency in this DAO.** That is a structural conflict of interest — not an accusation that it has been misused, but a real gap in how much any member can independently trust a result, including this one.

## What this proposal asks

1. **Endorse the technical RFC** at `closerdao/closer-ui#1178`, whose Phase 1 (`closerdao/closer-ui#1179`) already makes votes wallet-signed and published to IPFS — closing most of the gap to what Snapshot.org already provides for other DAOs, with a design that needed **no cooperation from Closer's private backend** to ship.
2. **Ask Closer's maintainers, on whatever timeline they can realistically commit to, to consider the small, optional backend steps** the RFC lays out (storing and passing through one additional field; eventually, real server-side signature verification). None of this proposal depends on that happening — it's an ask, not a blocker.
3. **In the meantime, authorize reactivating TDF's existing (currently inactive) Snapshot space**, `traditionaldreamfactory.eth` — 19 real proposals from 2022–2024, dormant since Dec 2024, currently configured to weight plain TDF only. Fix its strategy config to match TDF's actual formula (see `sepu85/tdf-snapshot-voting`'s `EXISTING-SNAPSHOT-SPACE.md`) and run it non-binding alongside at least one real Closer vote for comparison before any future proposal considers making it binding.
4. **Establish a rotating Governance Audit Committee** (3–5 members, elected or volunteer, explicitly excluding the Closer admin and anyone with a declared conflict on a given proposal) to manually verify results in the meantime — see `sepu85/tdf-snapshot-voting`'s `SOCIAL-AUDIT.md` for the process and its honestly-stated limits.

## Why a community mandate, not just a GitHub issue

Asking for this as one contributor to one maintainer, when that maintainer has a direct stake in the outcome, has limited leverage on its own. A passed TDF proposal converts the ask from "one member's request" into "the DAO's own instruction to its platform operator" — which is the actual fix to the conflict-of-interest problem, not just the technical one.

## What this proposal does *not* do

- It does not replace Closer or move TDF's real governance to Snapshot today. Reactivating the existing space (point 3) is explicitly non-binding until a later, separate proposal says otherwise.
- It does not assume bad faith on anyone's part. The gap described here is structural — it would exist regardless of who operates Closer, and closing it protects the admin's own credibility as much as anyone else's. Nor does the existing Snapshot space's incomplete formula (missing Presence, Sweat, staked TDF) imply anyone deliberately narrowed it — most likely it simply predates those tokens mattering, and nobody's gone back to update it since.

## Supporting material

- Full findings: the verifiability report already shared with the community, and `sepu85/tdf-governance-weight`.
- Technical RFC: `closerdao/closer-ui#1178`; its Phase 1 PR: `closerdao/closer-ui#1179`.
- Interim tooling: `sepu85/tdf-snapshot-voting` (this repo) — the existing-space findings, formula documentation, ready-to-use Snapshot strategy config, an independent verification script, and the social-audit process in detail.
