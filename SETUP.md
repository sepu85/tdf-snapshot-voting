# Setting up a TDF space on Snapshot

**Read [`EXISTING-SNAPSHOT-SPACE.md`](./EXISTING-SNAPSHOT-SPACE.md) first.** TDF already has a real space, `traditionaldreamfactory.eth` — 19 proposals, 2022–2024, currently inactive. Reactivating and fixing its strategy config (Plan A, below) is strongly preferred over creating a new one (Plan B) — it keeps the existing history, followers, and ENS identity instead of starting from zero.

## 1. Test first, on the demo network — either way

Before touching a real space (existing or new), create a throwaway one at **[demo.snapshot.org](https://demo.snapshot.org)** (a free sandbox that behaves identically to production Snapshot but isn't indexed or taken seriously by anyone). Paste in one of the strategy configs from [`snapshot-space-config.md`](./snapshot-space-config.md), create a test proposal, vote from a wallet you control, and confirm the voting power shown matches what [`verify.mjs`](./verify.mjs) computes for that same address. Do not skip this step — an ABI or address typo in a strategy config fails silently (Snapshot shows `0` voting power, not an error).

## 2a. Plan A (preferred): update the existing space

Covered in full in [`EXISTING-SNAPSHOT-SPACE.md`](./EXISTING-SNAPSHOT-SPACE.md) — who controls it, exactly what's missing (Presence, Sweat, staked TDF), and the steps to add them via Settings → Voting Strategies. Skip to step 3 below once that's done.

## 2b. Plan B (fallback only, if reactivation genuinely isn't possible): create a new space

1. Go to [snapshot.org](https://snapshot.org) → "Create a space." It's free.
2. Give it a name and, ideally, an ENS name matching TDF's existing identity (optional, costs a small on-chain registration if you want a custom ENS — a plain snapshot.org subdomain works fine without one).
3. In **Settings → Voting strategies**, paste the chosen variant's JSON from [`snapshot-space-config.md`](./snapshot-space-config.md).
4. Set the space's **network to Celo mainnet (chainId `42220`)**.
5. Leave **validation** at its default ("only members can propose," or similar) until the [membership-gating open question](./FORMULA.md#open-question-membership-gating) is resolved — don't guess at a gating config for a real space.

## 3. Run it in shadow mode before trusting it

For at least one real TDF proposal, run the *same* proposal on both Closer and this Snapshot space in parallel (Snapshot's result is non-binding during this period — say so explicitly in the proposal text). Compare:
- Do the aggregate tallies match (within the gap explained by whichever formula variant is used)?
- Does every voter who could vote on Closer also show up with sensible weight on Snapshot?

Only after this comparison checks out should the community consider treating a Snapshot result as binding for anything.

## 4. Ongoing verification

For any Snapshot proposal, anyone can independently check a voter's weight with:
```
node verify.mjs 0xTheirAddress
```
and compare it against what Snapshot's own UI reports for that address on that proposal. If they don't match, that's worth investigating before trusting the result — see [`SOCIAL-AUDIT.md`](./SOCIAL-AUDIT.md) for a process to do this systematically, not just ad hoc.

## What this does and doesn't give you

Moving to Snapshot for a vote gets you: every vote signed by the voter's own wallet (EIP-712), stored immediately and publicly (IPFS), and voting weight anyone can recompute from public chain data. It does **not** get you: protection from Snapshot's own infrastructure being down or wrong (it's still a hosted service), or resolution of the underlying conflict-of-interest question about who decides to *use* Snapshot's result for anything binding — that's still a TDF governance decision, not a technical one.
