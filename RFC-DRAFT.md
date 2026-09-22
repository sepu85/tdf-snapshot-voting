# RFC (draft): independently-verifiable DAO voting

> **Status:** draft, not yet posted. Prepared to be opened as a GitHub **Issue** on `closerdao/closer-ui` (labels: `design`, `help wanted`) — not a PR, since this is a design conversation before any code is proposed for merge. The repo's Discussions tab is enabled but has exactly one post ever (the default "welcome" message); Issues is where the team is actually active (134 open, mostly the maintainer's own recent tickets), so that's where this goes, framed clearly as `[RFC]` in the title so it isn't mistaken for a bug report. The concrete Phase 1 diff ([`phase1-closer-ui-patch.md`](./phase1-closer-ui-patch.md)) is meant to become a real, small PR referencing this issue shortly after — a working PR gets more attention than a request on its own. Replace `<n>` with the real issue number once opened, and update the cross-references in this repo to match.

## Summary

TDF's governance pages show a "tamper-evident" verification badge — a SHA-256 digest of the vote list, anchored on Celo. This is real, working infrastructure and proves a published tally hasn't been edited after the fact. It doesn't yet prove the tally was accurate or that individual votes came from the wallets credited with them, because:

- The stored per-vote "signature" (`createVoteSignatureHash` in `packages/closer/utils/crypto.ts`) is `sha256(proposal_description + ":" + vote_choice)` — identical for every voter who picks the same option, not a real wallet signature.
- `handleVote` in `packages/closer/pages/governance/[slug].tsx` already obtains a real wallet signature via `signMessage` — and its own code comment says this "would... submit the vote to Snapshot or a similar platform" — but the real signature is currently discarded and the fake hash is sent instead.
- No wallet address is sent or stored with a vote at all.

This RFC proposes closing that gap, in phases, without touching what already works.

## Why now / why this framing

- This isn't a critique of unfinished work — `packages/closer/components/Governance/__tests__/ProposalAttestation.test.tsx` already asserts an honest `governance_attestation_scope_note` string that the UI "never claims the blockchain validated the votes." The team already built in the correct disclosure; this RFC proposes finishing the guarantee behind it.
- `docs/tickets/governance-incremental-voting-api.md` (already in this repo, "status: ready for backend") already states: *"Each increment carries its own signature, so each one stays independently verifiable."* Real per-vote signatures are already assumed on the roadmap — this RFC is that assumption, made concrete.
- `documentation/governance-token/README.md` already describes TDF voting as "conducted using tools like Snapshot." This RFC is one way to make that true.

## Proposed phases

**Phase 1 — client-side plumbing (mergeable today, no backend change required).**
Stop discarding the real signature `handleVote` already obtains; send it plus the voter's wallet address as additive fields on `POST /proposals/:id/vote`. closer-api ignores unknown fields today, so this is non-breaking. Concrete diff: [`phase1-closer-ui-patch.md`](https://github.com/sepu85/tdf-snapshot-voting/blob/main/phase1-closer-ui-patch.md) in a companion repo.

**Phase 2 — documentation companion (mergeable today).**
A PR to `closerdao/documentation` proposing the updated `/proposals/:id/vote` contract as a clearly-marked "proposed, not yet implemented" spec, and correcting `governance-token/README.md`'s current Snapshot claim to link here.

**Phase 3 — EIP-712 signing design (this RFC, not code yet).**
What should actually be signed: `{ proposalId, choice, weight, incrementIndex, votedAt }` as typed data (the increment index anticipates the incremental-voting ticket's replay concerns). Two open questions for this thread:
- **Domain:** omit `verifyingContract` (Snapshot's own precedent — no on-chain enforcement to bind to) vs. nominally binding to a `proof-of-presence` contract address.
- **Weight-binding:** does the signed struct commit to a client-claimed weight closer-api must match, or is weight left purely server-computed with only `{proposalId, choice, incrementIndex}` signed? This one needs closer-api's input directly — it's a real protocol fork, not a client-side decision.

**Phase 4 — public data availability. Two paths, not mutually exclusive.**

*4a (proposed as the near-term default) — client-side, via IPFS, no closer-api rebuild needed.* Once Phase 1 lands, verifying a signature is pure public-key math (`ethers.utils.verifyMessage`) — no backend involvement required. The only real gap left is making the raw `{voterAddress, message, signature, weight}` data durably available to check against, and that's a data-availability problem `closer-ui` and the community can solve on their own: publish each vote receipt to IPFS from the browser at cast time, assemble a public per-proposal manifest, let anyone independently verify and re-tally. Full design: [`phase4-ipfs-alternative.md`](https://github.com/sepu85/tdf-snapshot-voting/blob/main/phase4-ipfs-alternative.md). The only thing this path asks of closer-api, and only if they're willing, is adding **one more field** — the manifest's CID — to the attestation transaction they already broadcast. That's a much smaller ask than 4b below, since it touches nothing they currently own.

*4b (the ideal, longer-term state) — backend enforcement in closer-api.* Actually verifying signatures server-side (rejecting bad ones at cast time, not just catching them after), storing and exposing wallet addresses, publishing a recomputable weight-snapshot block, and running a public vote-list endpoint. This is the part an outside PR structurally cannot deliver on its own — flagged here as a direct ask, not something 4a is meant to substitute for indefinitely. Realistic to pursue in parallel with 4a, on whatever timeline closer-api's maintainers can actually commit to.

## Backward compatibility

`ProposalLockState.proofAlgorithm` is already a versioned string field. Already-finalized proposals keep verifying under whatever algorithm they were finalized with — nothing above is retroactive. New proposals opt into a new `proofAlgorithm` value as each phase lands, coordinated with closer-api's `utils/proposalStatus.js` (which `proposalProofs.ts`'s own comment says this "has to stay byte-exact" with).

## What I'm asking for

- A read on Phase 1 — is the additive-fields approach above acceptable to merge as-is?
- Direction on the Phase 3 open questions (domain, weight-binding) — these need closer-api's perspective, not just closer-ui's.
- Whether Phase 4a (IPFS, client-side) is reasonable to build against `closer-ui` alone — it shouldn't need closer-api sign-off at all, but flagging it here so it's not a surprise.
- Whether adding the one manifest-CID field to the existing attestation transaction (the small ask inside 4a) is realistic, and separately, whether closer-api engagement on the fuller 4b is realistic to plan for on any timeline — so the community proposal referencing this RFC can set expectations honestly either way.

cc @acharlop — you're the most recent author across `crypto.ts`, `proposalProofs.ts`, `proposalAttestation.ts`, and the governance attestation UI/tests, so flagging this directly rather than hoping it's seen.

Related: a companion TDF governance proposal ([`TDF-PROPOSAL-DRAFT.md`](https://github.com/sepu85/tdf-snapshot-voting/blob/main/TDF-PROPOSAL-DRAFT.md)) will ask the community to formally back prioritizing Phase 4, given it depends on `closer-api` work outside what any outside contributor can deliver alone.
