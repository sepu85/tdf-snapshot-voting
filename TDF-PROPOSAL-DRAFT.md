# TDF governance proposal (draft): mandate for verifiable voting

> **Status:** draft, not yet submitted. Written to be posted through TDF's normal proposal process once the RFC ([`RFC-DRAFT.md`](./RFC-DRAFT.md)) has had initial technical engagement. Edit freely before submitting — this is a starting point, not a final text.

## Title

Mandate: make TDF governance voting independently verifiable

## Context

An analysis of how TDF's governance votes are recorded and verified found the current system to be **tamper-evident but not independently auditable**: it can prove a published result wasn't edited after the fact, but not that it was accurate when published, because Closer's backend alone controls voter eligibility, weight, tallying, and publication — with no outside check.

This matters specifically because **the same admin who operates the Closer platform is also a TDF citizen with strong agency in this DAO.** That is a structural conflict of interest — not an accusation that it has been misused, but a real gap in how much any member can independently trust a result, including this one.

## What this proposal asks

1. **Endorse the technical RFC** already opened at `closerdao/closer-ui#<n>`, which proposes making votes wallet-signed, publicly stored, and independently recomputable — closing the gap to roughly what Snapshot.org already provides for other DAOs.
2. **Ask Closer's maintainers to prioritize the backend portion** (Phase 4 of the RFC — real signature verification, published weight-snapshot blocks, a public per-proposal vote list) on a reasonable timeline. This is the part that structurally cannot be delivered by an outside contributor alone, since `closer-api` is a private repository.
3. **In the meantime, authorize a parallel, non-binding pilot on Snapshot.org**, replicating TDF's existing voting-weight formula exactly (see `sepu85/tdf-snapshot-voting`), run alongside at least one real Closer vote for comparison before any future proposal considers making it binding.
4. **Establish a rotating Governance Audit Committee** (3–5 members, elected or volunteer, explicitly excluding the Closer admin and anyone with a declared conflict on a given proposal) to manually verify results in the meantime — see `sepu85/tdf-snapshot-voting`'s `SOCIAL-AUDIT.md` for the process and its honestly-stated limits.

## Why a community mandate, not just a GitHub issue

Asking for this as one contributor to one maintainer, when that maintainer has a direct stake in the outcome, has limited leverage on its own. A passed TDF proposal converts the ask from "one member's request" into "the DAO's own instruction to its platform operator" — which is the actual fix to the conflict-of-interest problem, not just the technical one.

## What this proposal does *not* do

- It does not replace Closer or move TDF's real governance to Snapshot today. The Snapshot pilot (point 3) is explicitly non-binding until a later, separate proposal says otherwise.
- It does not assume bad faith on anyone's part. The gap described here is structural — it would exist regardless of who operates Closer, and closing it protects the admin's own credibility as much as anyone else's.

## Supporting material

- Full findings: the verifiability report already shared with the community, and `sepu85/tdf-governance-weight`.
- Technical RFC: `closerdao/closer-ui#<n>`.
- Interim tooling: `sepu85/tdf-snapshot-voting` (this repo) — formula documentation, ready-to-use Snapshot space config, an independent verification script, and the social-audit process in detail.
