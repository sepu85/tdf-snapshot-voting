# TDF's governance-weight formula

Source: [`sepu85/tdf-governance-weight`](https://github.com/sepu85/tdf-governance-weight)'s `index.html`, a live dashboard built and iterated on with the TDF community (also proposed as a real page in `closer-ui` via [PR #1014](https://github.com/closerdao/closer-ui/pull/1014)). All addresses below are read directly from that dashboard's source, not re-derived.

## Contracts (Celo mainnet, chainId `42220`)

| Token / contract | Address | Read via | Role |
|---|---|---|---|
| TDF | `0x10CB7F49389787A99b59B2f87dfDd3bba141559f` | `balanceOf(address)` | Base governance token |
| Presence | `0x5Bc8e45E6c0019F12bE2979De614AF3cc63538e9` | `balanceOf(address)` | Mints per night on-site, regardless of payment method |
| Sweat | `0x5D2870B37aB72AB9Cc3F46878373EeCc1312FA6e` | `balanceOf(address)` | Contribution/labor token — total supply is currently 0 on-chain, so it contributes nothing to any real result today, whatever weight it's given |
| Staking (Diamond DAO) | `0x475398EeE0E22cb6fe5403ffA294Fb10Ad989e17` | `stakedBalanceOf(address)` | TDF staked into the DAO — moves TDF out of the token's own `balanceOf` |
| Membersheep NFT | `0x6b4121DE536c7B31352D1044963c28f6f543e10a` | `balanceOf(address) > 0` | Membership marker, not a weight source — see [Open question: membership gating](#open-question-membership-gating) |

All four weight tokens are standard ERC20s; confirm each one's `decimals()` on-chain rather than assuming 18, though 18 is expected for all of them.

## The formula

```
weight(address) = TDF.balanceOf(address) + Staking.stakedBalanceOf(address)
                 + Presence.balanceOf(address)
                 + Sweat.balanceOf(address)
```

This is the "Total TDF" toggle in the `tdf-governance-weight` dashboard — TDF plus whatever's staked, counted as one pool, plus Presence and Sweat.

**Note on history:** an earlier version of this document described two variants, because staked TDF was excluded from production at the time — a bug that silently dropped it from every member's weight. That's since been corrected in production. There is only one formula to replicate now, and it's the one above; any Snapshot configuration should use it rather than the plain-`balanceOf`-only version some earlier notes in this repo describe.

Presence and Sweat are weighted at **×1** (equal to each other and to TDF), per the OASA whitepaper's own suggested formula. The dashboard's exploratory Sweat-multiplier slider (default ×5 in that UI) is for sensitivity analysis only — it is **not** a production or recommended value; don't carry it into a Snapshot config without an explicit community decision to do so.

**Not the same gap as TDF's existing Snapshot space.** `traditionaldreamfactory.eth` (see [`EXISTING-SNAPSHOT-SPACE.md`](./EXISTING-SNAPSHOT-SPACE.md)) is currently configured with *only* plain TDF `balanceOf` — no staking, no Presence, no Sweat. That's the gap Snapshot's own config needs to close, documented in [`snapshot-space-config.md`](./snapshot-space-config.md).

## Open question: membership gating

The whitepaper's Member requirement is that "Token Holders that are also Project DAO Members must be allowed to participate in the project's governance" — implying non-members shouldn't vote even if they hold tokens (e.g. via a secondary market), and the dashboard's "Open question" panel already flags addresses with token weight but no Membersheep NFT. Whether and how to enforce this on Snapshot is a `validation`-strategy question, not a `strategies`-array question — see [`snapshot-space-config.md`](./snapshot-space-config.md).

## What this formula does *not* decide

Whether to gate by membership is a community decision, not a technical one. This document exists so the community can make that decision with the real mechanics in front of them, not so this repo makes it for them.
