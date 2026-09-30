# Show Your Work: Make Our Votes Checkable

> Draft, for community discussion before formal submission. Background reading: [the governance report](https://claude.ai/artifact/JcAcGuKqtQPsP6vGqbgJbC) (finding 4) and its [plain-language companion](https://claude.ai/artifact/G4K84cwxagr1tCS7QY9n6n), and the technical thread at [closer-ui#1178](https://github.com/closerdao/closer-ui/issues/1178).

## What?

We're asking the DAO to back three steps, together, that let anyone check that a vote was counted correctly — not just trust that it was:

1. **Ask Closer's platform team to finish making votes checkable on our own platform.** Each vote should be signed by the voter's own wallet and published somewhere anyone can look, not only stored in a private database. This has already been requested in the open, with working code offered: [closer-ui#1178](https://github.com/closerdao/closer-ui/issues/1178).
2. **Reactivate TDF's own Snapshot space as a parallel, non-binding option in the meantime.** We already have one — 19 real proposals from 2022 to 2024, unused since. On Snapshot, every vote really is signed by a wallet and stored publicly, so anyone can check any result without trusting a single team's database. It needs its settings updated to count Presence and Sweat the way our platform does, and someone with access to do that. Snapshot also supports more than a plain yes/no/abstain — it can show a proposal as several options to choose between, or several to rank, not just one binary question. That would have let this very proposal be a real multi-choice vote instead of the bundled ask below.
3. **Ask Closer's team for a simple after-the-vote receipt.** After a vote closes, publish enough that any of us can look up our own vote and confirm it was counted once, correctly, at the right weight — no wallets, no technical steps, just something you could check like a receipt.

These aren't three options to choose between — they're three things that can all move forward at once, and none of them requires waiting on the others. Because our platform's own voting tool only supports yes, no or abstain, this proposal asks one question rather than three: **do we back pursuing all of this together?** A "Yes" is a mandate to pursue all three in parallel. It is not a commitment to make any one of them official — that's a separate decision, later, once we know more. (It's a small irony worth noting: the very limitation that forces this proposal into one bundled yes/no is itself one more thing Snapshot doesn't have.)

## Why?

Today, when you vote, a green tick tells you the result "matches the blockchain." That's true, but it proves less than it sounds like: it only shows the number hasn't been changed since it was published, not that the number was right to begin with. Your wallet doesn't actually sign your vote. The counting happens on a system only one party can see into — and there's no way for them to prove the count to you even if they wanted to, because the system was never built to produce that kind of proof. Nobody outside the platform can independently check that a vote count is correct.

We put our governance on a blockchain specifically so no single party would have to be trusted with the count. Right now, one still is.

This isn't an accusation. Nothing here says a result has ever been wrong, and the people who built and run our platform are stretched thin doing a hard job — their own reply on the issue above says as much, honestly:

> "In terms of prioritization though right now the highest priority is addressing a lot of the booking issues that are really negatively impacting [people living here] and others at the moment. So until the booking issues are resolved and we can guarantee a level of consistency…"

That's fair, and worth respecting. It's also why waiting on one fix, from one team, on one timeline, isn't a plan — it's a hope. This proposal exists so we don't have to just hope.

It matters more now than it used to. While every vote passed easily, nobody needed to check the plumbing. Last year's vote on the Land Development Plan was the first genuinely close one — and the moment a result is close, an uncheckable count can't settle a dispute about its own output. Better to fix this before that happens than after.

## Impact

If this passes:
- Anyone will eventually be able to independently confirm a vote result, instead of taking the platform's word for it.
- We stop being dependent on one team's timeline for something this important — the Snapshot pilot and the receipt ask both move regardless of when (or whether) the full platform fix lands.
- We get real, comparable data: at least one vote run in parallel on both our platform and Snapshot, so we can see for ourselves whether the numbers match.
- Nothing changes about how you vote today. Same wallet, same click, for all three tracks.

If it doesn't pass, nothing about how voting works today changes either way — we'd simply not be pursuing these fixes as a DAO-backed effort for now.

## Resources

Mostly time, not money:
- Someone (or a small group) to find who can access TDF's existing Snapshot space and update its settings — likely one of the wallets that authored our old DIP proposals, or whoever controls the `traditionaldreamfactory.eth` ENS name.
- Someone to run the side-by-side pilot vote and write up what it found.
- No budget ask. Snapshot is free to use. Reactivating our old space costs nothing beyond the time above.
- From Closer's team: their own time, on their own schedule, for tracks 1 and 3 — this proposal asks, it doesn't demand or fund.

## How?

1. **Track 1 (platform fix):** continues on the existing GitHub thread. Our role as a DAO is to show the team that citizens actually want this prioritized — this proposal, if it passes, is that signal.
2. **Track 2 (Snapshot pilot):** identify who controls the existing space, ask them to update its voting-weight settings to match our platform's formula, test it privately first, then run it non-binding alongside one real upcoming proposal so we can compare results directly.
3. **Track 3 (receipt ask):** send Closer's team a direct, specific request for a simple public vote-receipt page, informed by this proposal having passed.
4. **No new binding process yet.** Once we've actually run the Snapshot pilot and seen how it compares, a follow-up proposal — informed by that evidence, not guesswork — can ask the DAO whether to make anything here official.
