# Publishing votes to IPFS — design

> Revised after cross-checking an independent proposal from another TDF community member, who reached the same core idea separately and worked out real implementation detail (file structure, a sequence diagram, non-blocking failure handling, provider config) worth adopting directly. Two things in their version needed correcting first — see [Corrections](#corrections-from-the-independent-proposal) — everything below reflects the corrected, merged design.

## The key insight (why this needs no closer-api cooperation)

Once a vote carries a real wallet signature over a known payload, *verifying* it is pure public-key math (`ethers.utils.verifyMessage`) — anyone can do that themselves. The only real gap is **data availability**: making sure the signed data survives and is reachable outside Closer's server. IPFS solves that, entirely client-side.

## The flow

1. Member picks Yes / No / Abstain, as today.
2. Client builds a **structured JSON payload** instead of today's plain sentence:
   ```json
   { "proposalId": "...", "vote": "yes", "weight": 12.5, "votedAt": "2026-09-22T00:00:00.000Z" }
   ```
3. Wallet signs it with the **existing** `signMessage(message, account)` call — `personal_sign` over `JSON.stringify(payload)`. No wallet-provider changes needed; this is a strictly smaller lift than EIP-712 typed-data signing (see [Deferred: EIP-712](#deferred-eip-712-typed-data-signing) below) while still producing a signature that's cryptographically bound to specific, structured content instead of a loosely-worded sentence.
4. Client publishes the signed payload to IPFS via a pinning provider's HTTP API. **Non-blocking**: if this fails, the vote still submits normally — the member sees a "not published" marker instead of a CID, never a blocked vote.
5. Client shows the member their CID and a public gateway link (`https://ipfs.io/ipfs/<cid>`, or any other public gateway — independent of whichever provider pinned it) immediately. This alone is new: today voters get no receipt at all.
6. Client submits the vote to Closer's **existing, unchanged** `/proposals/:id/vote` endpoint, now additionally carrying `cid` alongside the `voterAddress`/`walletSignature`/`signedMessage` fields already proposed. closer-api can ignore all of these safely.
7. **If** closer-api happens to store and return the `cid` field (no verification logic required — just pass-through), Closer's own existing per-proposal vote list becomes a ready-made public discovery index for free, and nothing else needs to change there.
8. **If not**, a community-run index (this repo, or a dedicated sibling) can serve the same purpose: each voter's own client already knows its own CID, so an external index just needs voters (or their clients) to report it somewhere public — a real but smaller ask than backend cooperation.
9. Anyone, at any time, can re-fetch any CID, `verifyMessage` its signature against the claimed address, and cross-check the weight against [`verify.mjs`](./verify.mjs) — extending the same kind of check `ProposalAttestation.tsx` already does for the aggregate, down to each individual vote.

## Files (corrected to target the real vote flow)

- **New: `packages/closer/utils/ipfsVote.helpers.ts`** — `buildVotePayload(proposalId, vote, account, weight, votedAt)` (builds the structured object to sign) and `publishVoteToIPFS(signedPayload)` (POSTs to the pinning provider, returns a CID, wrapped in its own try/catch so a provider outage never surfaces as a failed vote).
- **`packages/closer/pages/governance/[slug].tsx`, `handleVote`** — this is the actual function members vote through (see [Corrections](#corrections-from-the-independent-proposal)). Builds the structured payload, signs it via the existing `signMessage`, publishes to IPFS, shows the CID, sends the vote (plus `cid` and the other additive fields) exactly as before.
- **Same file, the proposal's vote-list rendering** — each vote row gains its CID (or "not published" for anything cast before this change).
- **`packages/closer/components/Governance/ProposalAttestation.tsx`** — a parallel per-vote check (fetch a CID, verify its signature, confirm it matches what's displayed) extends the aggregate check this component already does, rather than introducing a new pattern.
- **`packages/closer/types/proposal.ts`** — `ProposalVote` gains an optional `cid?: string`, alongside the `voterAddress`/`walletSignature`/`signedMessage` fields already proposed.

## Config

```
NEXT_PUBLIC_IPFS_PINNING_TOKEN   # API key for the pinning provider, left unset by default
IPFS_PINNING_ENDPOINT            # provider's upload URL, alongside GOVERNANCE_URL in config
```
Provider choice is swappable behind these two values — the only property that matters is independence from Closer. web3.storage, Pinata, and NFT.Storage all work; pick whichever has the friendliest free tier at TDF's (small) proposal volume.

## Corrections from the independent proposal

The community member's original write-up targeted `VoteModal.tsx` as "the one component members actually vote through." **That's not accurate** — `VoteModal.tsx` is unused: it isn't imported by `pages/governance/[slug].tsx` (the real proposal detail page) or anywhere else in the app, only re-exported from a barrel file. The real vote-casting logic is `handleVote` inside `[slug].tsx` itself. A PR built against `VoteModal.tsx` as originally proposed would be dead code with no effect on real voting. Every reference above has been corrected to target `[slug].tsx`'s `handleVote`. (Separately, `VoteModal.tsx` has the exact same discard-the-real-signature bug this whole effort is about — worth fixing or removing for consistency, but it's a footnote, not the main fix.)

The original write-up's Snapshot-comparison table also stated TDF's voting weight as "TDF + Presence + Sweat×5." Per [`FORMULA.md`](./FORMULA.md) (sourced directly from the `tdf-governance-weight` dashboard), ×5 is that dashboard's *exploratory* sensitivity-analysis slider default, not a production or recommended value — the whitepaper-aligned weighting is Presence×1 and Sweat×1 (Sweat's real contribution is currently ~0 regardless, since its total supply is 0 on-chain today). Worth a heads-up to that community member if this table gets reused elsewhere.

## What the independent proposal got right (adopted as-is)

- **Non-blocking IPFS publish** — a provider outage must never block a vote. Now a hard requirement above, not an afterthought.
- **Structured payload signed via existing `personal_sign`**, deferring full EIP-712 — see below. This is the single biggest simplification: it means Phase 1 needs *zero* wallet-provider changes.
- **A dedicated `ipfsVote.helpers.ts` helper file**, keeping payload-building and publishing separate from `handleVote`'s own logic.
- **Concrete, codebase-consistent config var naming** (`NEXT_PUBLIC_...` prefix, matching the existing `NEXT_PUBLIC_FEATURE_WEB3_WALLET` pattern).
- **Explicitly naming the privacy trade-off**: publishing to IPFS makes every voter's wallet address public next to their choice, permanently, the moment they vote — same trade-off Snapshot makes, but a real change from today's "only your own vote is visible to you" behavior. This deserves a clear, upfront notice to members before this ships, not a footnote — flagged prominently in the RFC now, not left implicit.
- **A lighter "Phase 2"**: once every vote is independently checkable, the proposal page can sum the published CIDs client-side and show that total next to Closer's own, as a visible cross-check rather than asking anyone to trust either number blindly. Publishing the weight-computation inputs (balances read, at what timestamp) makes weight itself reproducible too, closing the remaining gap with Snapshot without needing closer-api to rebuild anything.

## Deferred: EIP-712 typed-data signing

A nicer wallet UX (a structured field-by-field confirmation instead of a raw JSON string in the signing prompt) and stronger domain-separation would come from real EIP-712 typed data, which needs a new `signTypedData` method added to `packages/closer/contexts/wallet/WalletProviderWithReown.js` (today only raw `personal_sign` exists). This is **not required** to get Phase 1's trust benefits — personal_sign over a structured JSON string already produces a signature that's independently verifiable and bound to specific content. Worth doing eventually; not worth blocking Phase 1 on.

## Open questions

- What happens for a member with no connected wallet, or whose publish step fails? Proposed: non-blocking, the vote still counts, flagged unpublished.
- The permanent public wallet-address exposure noted above — does this need an explicit member-facing notice/consent step before rollout, given it's a real behavior change from today?
- Cost/rate limits of the chosen pinning provider at TDF's actual (small) proposal volume — unlikely to matter, but worth a sanity check before picking one.
- Should already-cast votes be backfilled to IPFS retroactively? Not possible trustlessly — only Closer holds that history today — so the public record most likely starts from rollout forward, and that's fine to say plainly rather than pretend otherwise.
