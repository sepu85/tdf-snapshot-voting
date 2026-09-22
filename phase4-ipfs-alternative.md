# Phase 4, alternative path: IPFS + client-side, minimal backend ask

The original Phase 4 (see [`RFC-DRAFT.md`](./RFC-DRAFT.md)) asks `closer-api` maintainers to rebuild the trust-critical parts of the backend: verify signatures, store/serve wallet addresses, publish a weight-snapshot block, expose a public vote-list endpoint. That's a lot to ask of a team that may not prioritize it quickly — especially given the conflict-of-interest dynamic this whole effort exists because of. This document lays out an alternative that gets most of the same guarantee **without waiting on closer-api to rebuild anything**, plus one much smaller ask if they're willing to help at all.

## The key insight

Once Phase 1 lands (the client already obtains and can send a real wallet signature), **verifying that signature needs no backend cooperation at all** — it's pure public-key math anyone can run themselves:
```js
const recovered = ethers.utils.verifyMessage(message, signature);
recovered.toLowerCase() === voterAddress.toLowerCase(); // true/false, checkable by anyone
```
`ethers` is already a dependency of `closer-ui`. The only thing that actually requires cooperation from *someone* is **making the raw data available** to verify against — that's a data-availability problem, not a cryptography problem, and IPFS is built for exactly this.

## Design

1. **Client-side vote receipts.** Right after `signMessage` succeeds in `handleVote` (Phase 1), build a small JSON receipt:
   ```json
   {
     "proposalId": "...", "proposalSlug": "...",
     "voterAddress": "0x...", "vote": "yes", "weight": 12.5,
     "votedAt": "2026-09-22T00:00:00.000Z",
     "message": "I am voting yes on proposal ...",
     "signature": "0x..."
   }
   ```
   and upload it to IPFS **directly from the browser**, via a public pinning API (web3.storage/Storacha or Pinata both have free tiers with a browser-callable REST API). This happens in parallel with — not instead of — the existing `POST /proposals/:id/vote` call, so nothing about today's flow breaks.
2. **Give the voter a real receipt.** Show the resulting CID (`ipfs://<cid>`, or a gateway link) to the voter. Today they get no portable proof they voted at all; this is a strict improvement on its own.
3. **A public, append-only manifest per proposal.** Collect CIDs as they're cast into a per-proposal list. This can be as simple as a file in a public repo the community maintains (e.g. a sibling to this repo), or a shared IPFS directory. Whoever assembles it is a convenience, not a trust dependency — every entry is independently checkable (see step 4), and the manifest's own completeness can be cross-checked against the full vote list Closer's proposal page already sends client-side in `__NEXT_DATA__` (see the verifiability report).
4. **Anyone can audit, any time.** Fetch every CID for a proposal, `verifyMessage` each one against its claimed `voterAddress`, cross-check each address's weight with [`verify.mjs`](./verify.mjs), sum the results, and compare against what Closer/the chain published. This is real, provable evidence of a match or a mismatch — not a request for anyone to trust a report.

## The one small ask of closer-api, if they're willing

Instead of asking Closer to rebuild verification and storage (the original Phase 4), ask for **one additional field** on the attestation transaction they already broadcast: the manifest's own CID (or its Merkle root), alongside the existing `proofsHash`. This:
- Requires no change to their verification logic, no new storage design, no new endpoint.
- Anchors the community-assembled manifest to the same on-chain publication step that already exists — so the manifest itself becomes tamper-evident the same way the aggregate tally already is.
- Is a much smaller, much harder-to-reasonably-decline ask than the full Phase 4, precisely because it doesn't touch anything they currently own or control.

If even this doesn't land, the manifest is still independently useful and auditable without it — it just doesn't get the extra on-chain anchor.

## Honest limitations

- **Pinning ≠ permanence.** A CID stays cryptographically valid forever, but the *content* behind it can become unfetchable if nobody's pinning it. Mitigate with a funded pinning-service tier, and/or by encouraging voters to pin their own receipt locally — many independent pinners is arguably *more* robust than depending on Closer's one server, not less.
- **Someone has to own the pinning API key.** Small, cheap, ongoing operational responsibility — DAO vote volumes are tiny by IPFS standards, well within any free or low-cost tier.
- **This doesn't stop a compromised backend from publishing a wrong number.** It gives the community a concrete, provable way to catch a mismatch after the fact — it doesn't (on its own) prevent one from being published in the first place. That prevention step is still the original Phase 4's job, if and when closer-api takes it on.
- **Real-time visibility trade-off.** Publishing receipts at cast-time (not just at finalize) makes votes visible as they're cast — the same trade-off Snapshot makes. A commit-reveal scheme (publish encrypted, reveal the key at finalize) would fix this but adds real complexity; flagged as possible future work, not required for v1.
