# Snapshot space configuration

> **Read [`EXISTING-SNAPSHOT-SPACE.md`](./EXISTING-SNAPSHOT-SPACE.md) first.** TDF already has a real Snapshot space (`traditionaldreamfactory.eth`, 19 proposals, 2022–2024) — its *current* strategy config is just plain TDF `erc20-balance-of`, confirmed live against Snapshot's own API. Presence, Sweat, and staked TDF aren't configured at all. The configs below are for **updating that existing space** (preferred — see who controls it) or, only if that's genuinely not possible, configuring a new one from scratch.

These are literal `strategies` arrays to paste into a Snapshot space's settings (Settings → Voting strategies → "Add strategy" → or paste directly if using the raw JSON editor). All facts below about Snapshot's own strategy behavior were confirmed directly against [`snapshot-labs/snapshot-strategies`](https://github.com/snapshot-labs/snapshot-strategies) (the source of truth Snapshot itself uses), not assumed.

## How Snapshot combines multiple strategies

A space can configure **up to 8 strategies**. If more than one is configured, a voter's final voting power is the **cumulative sum** of every strategy's score for that address — there's no separate "weighted average" mode. That's exactly what's needed here: since [`FORMULA.md`](./FORMULA.md) weights every token at ×1, four separate ×1 strategies summed together reproduce the formula exactly, with zero custom code.

Neither `erc20-balance-of` nor `contract-call` (below) has a built-in numeric multiplier field. If the community later decides some token should count at, say, ×2 relative to the others, the two options are: (a) understating that token's `decimals` param by one per 10× step (a documented trick, but only gives powers of ten), or (b) a real strategy PR to `snapshot-labs/snapshot-strategies`. Neither is needed for the ×1/×1/×1/×1 case below.

## Network

Set the space's network to **Celo mainnet, chainId `42220`**, for every strategy below.

## Variant 1 — "As production reads it today" (TDF `balanceOf` only, no staked TDF)

```json
{
  "strategies": [
    ["erc20-balance-of", {
      "address": "0x10CB7F49389787A99b59B2f87dfDd3bba141559f",
      "symbol": "TDF",
      "decimals": 18
    }],
    ["erc20-balance-of", {
      "address": "0x5Bc8e45E6c0019F12bE2979De614AF3cc63538e9",
      "symbol": "Presence",
      "decimals": 18
    }],
    ["erc20-balance-of", {
      "address": "0x5D2870B37aB72AB9Cc3F46878373EeCc1312FA6e",
      "symbol": "Sweat",
      "decimals": 18
    }]
  ]
}
```

## Variant 2 — "Whitepaper-aligned / corrected" (adds staked TDF)

Same as Variant 1, plus a `contract-call` strategy reading `stakedBalanceOf` on the staking contract:

```json
{
  "strategies": [
    ["erc20-balance-of", {
      "address": "0x10CB7F49389787A99b59B2f87dfDd3bba141559f",
      "symbol": "TDF",
      "decimals": 18
    }],
    ["contract-call", {
      "address": "0x475398EeE0E22cb6fe5403ffA294Fb10Ad989e17",
      "decimals": 18,
      "symbol": "staked TDF",
      "methodABI": {
        "constant": true,
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "stakedBalanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    }],
    ["erc20-balance-of", {
      "address": "0x5Bc8e45E6c0019F12bE2979De614AF3cc63538e9",
      "symbol": "Presence",
      "decimals": 18
    }],
    ["erc20-balance-of", {
      "address": "0x5D2870B37aB72AB9Cc3F46878373EeCc1312FA6e",
      "symbol": "Sweat",
      "decimals": 18
    }]
  ]
}
```

**Before trusting either config for a real vote:** verify the `methodABI` against the staking contract's actual verified source on [Celo Blockscout](https://celo.blockscout.com/address/0x475398EeE0E22cb6fe5403ffA294Fb10Ad989e17) — the ABI above is written from the method name/behavior documented in `tdf-governance-weight`'s `index.html`, but Snapshot's `contract-call` strategy will silently return `0` (not an error) if the ABI doesn't actually match, which would understate every staked voter's weight without anyone noticing. Test on `demo.snapshot.org` first (see [`SETUP.md`](./SETUP.md)) and spot-check a few known-staked addresses with [`verify.mjs`](./verify.mjs) before using this on a real space.

## Open question: membership gating

Neither variant above restricts *who* can vote — only *how much weight* they get. If the community wants to require Membersheep NFT ownership to vote at all (per the whitepaper's Member requirement), that belongs in Snapshot's separate **`validation`** space setting, not the `strategies` array. Snapshot supports NFT-ownership-based validation strategies, but the exact space-settings JSON for gating specifically by Membersheep NFT ownership needs to be worked out and tested against a real Snapshot space before it's added here — flagged as unresolved rather than guessed.
