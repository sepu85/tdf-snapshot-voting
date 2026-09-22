# RFC: independently-verifiable DAO voting

> **Status:** posted as [closerdao/closer-ui#1178](https://github.com/closerdao/closer-ui/issues/1178). **Phase 1 is now a real, open PR: [closerdao/closer-ui#1179](https://github.com/closerdao/closer-ui/pull/1179)** — built on the real upstream `develop`, verified locally before pushing (new unit tests 6/6, the existing `proposalProofs`/`proposalAttestation`/`ProposalAttestation` suites unmodified and still 54/54, full `closer` package suite 2660/2660, lint/typecheck/prettier all clean). This file stays as the design record; the issue and PR are now the live threads.

## Summary

TDF's governance pages show a "tamper-evident" verification badge — a SHA-256 digest of the vote list, anchored on Celo. This is real, working infrastructure and proves a published tally hasn't been edited after the fact. It doesn't yet prove the tally was accurate or that individual votes came from the wallets credited with them, because:

- The stored per-vote "signature" (`createVoteSignatureHash` in `packages/closer/utils/crypto.ts`) is `sha256(proposal_description + ":" + vote_choice)` — identical for every voter who picks the same option, not a real wallet signature.
- `handleVote` in `packages/closer/pages/governance/[slug].tsx` already obtains a real wallet signature via `signMessage` — and its own code comment says this "would... submit the vote to Snapshot or a similar platform" — but the real signature is currently discarded and the fake hash is sent instead.
- No wallet address is sent or stored with a vote at all.

This RFC proposes closing that gap, in phases, without touching what already works, and **without needing closer-api (the private backend) to do anything at all** for the part that matters most (Phase 1).

## Why now / why this framing

- Recent Findings on [TDF Governance Vote Verifiability — Proposal #24 Findings](https://claude.ai/artifact/1GwGswG87hYETcbkZ2b3P1#49fae162-f89b.m75976w5ayj.9073~how-this-compares-to-snapshot) brought to evidence that Closer voting system proves a voting result wasn't tampered with after publishing the result fact. __It does not prove the result was tallied honestly and correctly in the first place__.
- Not a critique of unfinished work — `packages/closer/components/Governance/__tests__/ProposalAttestation.test.tsx` already asserts an honest `governance_attestation_scope_note` string that the UI "never claims the blockchain validated the votes." The team already built the correct disclosure; this RFC proposes finishing the guarantee behind it.
- `docs/tickets/governance-incremental-voting-api.md` (already in this repo, "status: ready for backend") already states: *"Each increment carries its own signature, so each one stays independently verifiable."* Real per-vote signatures are already assumed on the roadmap.
- `documentation/governance-token/README.md` already describes TDF voting as "conducted using tools like Snapshot." This RFC is one way to make that true.
- This proposal converges with one independently raised by another TDF community member, arrived at separately — worked-out implementation detail from that proposal is folded in below (see [`ipfs-design.md`](https://github.com/sepu85/tdf-snapshot-voting/blob/master/ipfs-design.md) for the full design and what was corrected from it).

## Proposed phases

**Phase 1 — structured, wallet-signed vote receipts, published to IPFS. Open as [closerdao/closer-ui#1179](https://github.com/closerdao/closer-ui/pull/1179); needs zero closer-api changes to work.**

- Instead of signing a loose sentence, `handleVote` builds a small structured payload (`{ proposalId, vote, weight, votedAt }`) and signs it with the **existing** `signMessage`/`personal_sign` call — no wallet-provider changes needed.
- A new `packages/closer/utils/ipfsVote.helpers.ts` publishes the signed payload to IPFS via a pinning provider's HTTP API (config: `NEXT_PUBLIC_IPFS_PINNING_TOKEN`, `IPFS_PINNING_ENDPOINT`) and returns a CID. **Non-blocking**: if publishing fails, the vote still submits normally, flagged "not published" instead of blocked.
- The member sees their CID and a public gateway link immediately — a real vote receipt, which doesn't exist today.
- The existing `POST /proposals/:id/vote` call gains additive fields: `voterAddress`, `walletSignature`, `signedMessage`, and now `cid`. closer-api can safely ignore all of them; if it happens to store and return `cid` too, Closer's own existing per-proposal vote list becomes a ready-made public discovery index for free — a much smaller ask than a backend rewrite, since it's pure pass-through with no new verification logic.
- Anyone, anytime, can independently re-fetch a CID, verify its signature (`ethers.utils.verifyMessage` — already a dependency), and cross-check the claimed weight, extending the same kind of check `ProposalAttestation.tsx` already runs for the aggregate down to each individual vote.
- Full design, file list, and the two corrections made to the community member's original version: [`ipfs-design.md`](https://github.com/sepu85/tdf-snapshot-voting/blob/master/ipfs-design.md). The PR itself: [closerdao/closer-ui#1179](https://github.com/closerdao/closer-ui/pull/1179) (the design record it was built from is kept at [`phase1-closer-ui-patch.md`](https://github.com/sepu85/tdf-snapshot-voting/blob/master/phase1-closer-ui-patch.md)).
- **Real behavior change to flag explicitly, not bury**: publishing to IPFS makes every voter's wallet address public next to their choice, permanently, the moment they vote — the same trade-off Snapshot makes, but different from today's "only you see your own vote" behavior. Worth a clear member-facing notice before this ships, not just a technical footnote.

**Phase 2 — client-side cross-check, still closer-ui-only.**
Once every vote is independently checkable, the proposal page can sum the published CIDs' weights client-side and show that total next to Closer's own, as a visible cross-check rather than asking anyone to trust either number blindly. Publishing the weight-computation inputs (which balances, read at what timestamp) makes the weight itself reproducible, not just the vote — closing most of the remaining gap with Snapshot's model without closer-api rebuilding anything.

**Phase 3 (deferred, optional) — EIP-712 typed-data signing.**
A nicer wallet UX (structured field-by-field confirmation instead of a raw JSON string in the sign prompt) via real typed data, needing a new `signTypedData` method in `packages/closer/contexts/wallet/WalletProviderWithReown.js`. Not required for Phase 1's trust benefits — `personal_sign` over a structured payload already gets there. Worth doing eventually, not worth blocking on.

**Phase 4 (only if closer-api wants to help, not required for anything above) — backend enforcement.**
Actually verifying signatures server-side (rejecting bad ones at cast time, not just catching them after), publishing a recomputable weight-snapshot block, running a dedicated public vote-list endpoint. This is the part an outside PR structurally cannot deliver, and — given Phases 1–2 already get most of the way there without it — no longer the blocking ask it once was.

## Backward compatibility

`ProposalLockState.proofAlgorithm` is already a versioned string field. Already-finalized proposals keep verifying under whatever algorithm they were finalized with — nothing above is retroactive.

## What I'm asking for

- A review of [#1179](https://github.com/closerdao/closer-ui/pull/1179) — anything about the additive fields (`voterAddress`, `walletSignature`, `signedMessage`, `cid`) or the IPFS provider choice that needs to change before it's mergeable?
- Whether closer-api storing and returning the `cid` field (pure pass-through, no verification logic) is realistic on any timeline — it's a much smaller ask than full Phase 4 enforcement, and meaningfully simplifies discovery if you're willing.
- Any concerns about the member-facing privacy change (permanent public address-to-vote linkage) that should shape rollout — e.g. a notice step, or an opt-in period.

cc @acharlop — most recent author across `crypto.ts`, `proposalProofs.ts`, `proposalAttestation.ts`, and the governance attestation UI/tests.

Related: a companion TDF governance proposal (only drafted atm) ([`TDF-PROPOSAL-DRAFT.md`](https://github.com/sepu85/tdf-snapshot-voting/blob/master/TDF-PROPOSAL-DRAFT.md)) explains the conflict-of-interest context and options for the wider community, independent of this technical thread.
