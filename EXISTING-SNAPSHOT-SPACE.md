# TDF already has a Snapshot space — reactivate it, don't start over

Everything below is sourced directly from Snapshot's own GraphQL API (`https://hub.snapshot.org/graphql`), queried live while researching this repo — not from documentation or hearsay. Re-run the queries yourself if you want to double-check any of it; they're plain HTTP, no auth required.

## It's real, and it has history

TDF's `packages/closer/config.ts` carries a leftover constant, `GOVERNANCE_URL: 'https://snapshot.org/#/traditionaldreamfactory.eth'` — unused anywhere else in the codebase, but not a placeholder. The space is real:

- **19 proposals**, spanning **October 2022 to December 2024**: DIP-1 through DIP-18 (Land, Legal, Communication, Coordination, Community, Token Engineering, and Executive circle roadmaps, citizenship requirements, a rewards program) plus a standalone "Tiny House Development Plan."
- **47 followers.**
- Network: Celo (chainId `42220`) — the same chain everything else in this repo reads from.
- **Nothing since Dec 18, 2024** (`DIP-18: Updates to citizenship benefits`, 3 votes). Governance moved to Closer's in-house system at some point after that. Why isn't something this repo can determine from the outside — worth asking directly rather than assuming.

## What it's actually configured to weight — confirms the suspicion

```graphql
{ space(id: "traditionaldreamfactory.eth") { strategies { name params } validation { name params } voting { type quorum } } }
```
returns:
```json
{
  "strategies": [
    { "name": "erc20-balance-of", "params": { "symbol": "TDF", "address": "0x10CB7F49389787A99b59B2f87dfDd3bba141559f", "decimals": 18 } }
  ],
  "validation": { "name": "any", "params": {} },
  "voting": { "type": "single-choice", "quorum": 500 }
}
```

**Confirmed: only plain TDF `balanceOf` counts.** Presence, Sweat and staked TDF are not configured at all — none of the four inputs [`FORMULA.md`](./FORMULA.md) documents, beyond plain TDF. `validation: "any"` means anyone can currently submit a proposal (no membership gate), and quorum is a flat `500` (TDF-weighted, given the strategy above).

## Who can actually change this

Two separate things control a Snapshot space, and they don't currently overlap here:

1. **Listed space admins** (from `space.admins`):
   - `0xf905c05a274b4775432b43d1b651e26039ec6354`
   - `0x1faf59040e9087675a7198e3c79d34de2f5796b1`
   - `0xaf160e879abe686d9174bd769ed129272f5c08c8`

   These three addresses aren't anonymous to TDF's history — they're the exact authors of **every one of the 19 historical proposals** listed above. Whoever ran TDF's governance from 2022–2024 controls these wallets, and is very likely identifiable to long-standing community members even though this repo has no way to attach names to addresses.

2. **The ENS name itself**, `traditionaldreamfactory.eth`, currently resolves to `0x9151e20ec7f2D89D78C92B9edD86DFAFB664e985` — a **different address from all three listed admins**. For an ENS-based Snapshot space, ENS ownership is the ultimate control mechanism: whoever holds the ENS name can always administer (or reclaim admin rights on) the corresponding space, regardless of the explicit admins list. Worth checking who controls this address too — it may be a multisig, a different early-team wallet, or something else entirely.

## How to update the strategies, if you're an admin

1. Connect the controlling wallet at [snapshot.org](https://snapshot.org), navigate to `traditionaldreamfactory.eth`.
2. Space Settings → Voting Strategies.
3. Add the missing strategies from [`snapshot-space-config.md`](./snapshot-space-config.md) — `contract-call` for staked TDF, and `erc20-balance-of` for Presence and Sweat — alongside the existing TDF strategy (don't remove it — Snapshot sums scores across all configured strategies, so adding is additive).
4. Save, then test with a throwaway proposal before trusting it for anything real — same "verify with [`verify.mjs`](./verify.mjs) against a few known addresses" advice as [`SETUP.md`](./SETUP.md) gives for a new space.
5. While in there: consider whether `validation: "any"` and the flat `quorum: 500` still match current governance intent — both predate this effort and are worth a deliberate decision, not just inheriting silently.

## If nobody in the community currently controls any of these four addresses

1. **Ask around first.** The three admin addresses are literally the people who ran TDF governance for two years — someone in the community almost certainly knows who they are or how to reach them, even if this repo doesn't.
2. **Snapshot has a space-recovery process** for genuinely abandoned spaces in some cases — not guaranteed, and not something to promise on their behalf, but worth raising with their support if step 1 comes up empty.
3. **Fallback: create a new space.** [`SETUP.md`](./SETUP.md) covers this as Plan B. It's strictly worse than reactivating the existing one — it throws away 19 proposals of real governance history, 47 followers, and the ENS identity the community already recognizes — so treat it as a last resort, not a first move.

## Why reactivating beats starting fresh

A new space is a blank slate nobody has to trust yet. This one already has a track record: real proposals, real votes, a name TDF members may already recognize from 2022–2024. Fixing its configuration (adding Presence, Sweat, staked TDF) is a smaller, more legible ask than "trust this brand-new thing" — and it's the more honest move, since the gap being fixed here is exactly the kind of silent, unexplained scope-narrowing (a formula that quietly dropped two of four inputs) this whole effort exists to catch.
