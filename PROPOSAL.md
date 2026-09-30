# Show Your Work

*A TDF governance proposal — three ways to make our own votes checkable by anyone, bundled into one ask.*

> Draft, for community discussion before a formal vote. Background: [the governance report](https://claude.ai/artifact/JcAcGuKqtQPsP6vGqbgJbC) (finding 4), its [plain-language companion](https://claude.ai/artifact/G4K84cwxagr1tCS7QY9n6n), and the technical thread at [closer-ui#1178](https://github.com/closerdao/closer-ui/issues/1178).

Some of you already read the governance report from this year's Gathering, or its short version. One finding in it keeps coming up in conversation, so it gets its own proposal: **right now, nobody outside the platform can check that a vote count is correct — and there's no way for the platform to prove it to you even if it wanted to, because the system that runs our votes was never built to produce that kind of proof.**

That's not a small thing for a DAO. So here are three ways we could fix it, in plain words, with the honest trade-offs of each. This isn't asking you to pick one. It's asking us to look at them together before a real vote in the next week or two.

## Why this needs fixing

When you vote today, you connect your wallet and a green tick later tells you the result "matches the blockchain." That tick is real. But all it proves is that the number hasn't changed since it was published — not that the number was right to begin with. Your wallet never actually signs your vote. The counting happens on a private system that only one party can see into.

We put our governance on a blockchain specifically so no single party would have to be trusted with the count. Right now, one party still is.

> Nobody is accusing anyone of anything, and nothing here says a result has ever been wrong. It says that if a close vote were ever disputed, we currently have no way to settle the argument except by trusting each other's word — and a community that has to rely on personal trust for something this important hasn't quite finished building the institution yet.

We only noticed how much this mattered because last year's vote on the Land Development Plan was the first one that was actually close. While every vote passed easily, nobody thought to check the plumbing. Now that we know how to disagree with each other, it's worth being able to prove the count when it counts.

## Three ways forward

You wouldn't need to save any codes, understand any cryptography, or do anything differently when you vote. Each option below changes what happens behind the scenes, not what voting feels like for you.

### 1. Ask Closer to fix their own platform
*the ideal outcome, on their timeline*

This is our platform's own team properly finishing what they started: make each vote actually signed by your wallet, and published somewhere anyone can check — not just a private database. This is the best outcome if it happens, because it fixes the actual tool we vote on, for good, without anyone needing to learn a second system.

Someone from our community already opened this as a request with the team that builds the platform, in the open, where anyone can read it: [closer-ui #1178](https://github.com/closerdao/closer-ui/issues/1178). Part of the fix is already written and offered to them as ready-to-use code.

**The honest part.** Their team wrote back, and it's worth reading in full rather than as a brush-off:

> "In terms of prioritization though right now the highest priority is addressing a lot of the booking issues that are really negatively impacting [people living here] and others at the moment. So until the booking issues are resolved and we can guarantee a level of consistency…"

That's a small team doing too much with too little, being straight with us about it — booking problems for people who actually live here understandably come before a governance fix nobody has been hurt by yet. Which is fair. It also means we shouldn't sit and wait for it before doing anything else.

**What this means for you:** worth asking for, worth being patient about, and not something to plan our next vote around.

### 2. Vote on Snapshot in the meantime
*borrows a fix that already exists*

Snapshot is the voting tool most crypto communities use, TDF included — before we built our own. Our old space is still there: **19 real proposals, from 2022 to 2024**, sitting unused since. On Snapshot, every vote really is signed by your wallet and stored somewhere public, so anyone can check any vote at any time. Nobody has to trust a single team's database, because there isn't one to trust.

For you, voting would feel almost identical: connect your wallet, pick yes, no or abstain. The difference is entirely on the checking side, not the voting side. The catch is that it's currently only set up to count plain TDF tokens — it would need updating to count Presence and Sweat too, the same way our own platform does, and someone who can access the old space's settings would need to do that update.

Worth knowing too: Snapshot doesn't force every proposal into a plain yes/no/abstain the way our platform does — it can show several options to choose between, or rank. Our own platform's rigid yes/no/abstain is part of why this very proposal has to bundle three ideas into one ask instead of letting you weigh them separately (more on that below). Snapshot wouldn't have that limitation.

**What this means for you:** same wallet, same click, but this time anyone — including you — could independently prove the result afterward.

### 3. Ask Closer for a simple after-the-vote check
*smallest ask, biggest trust gap it can't quite close*

This doesn't touch how voting works at all. It asks the platform to publish, after each vote closes, enough information that you personally could look up your own vote and see: yes, this is exactly what I voted, counted exactly once, at the weight I actually had. No wallets, no codes, no technical steps — just a page you could check the way you'd check a receipt.

It's the easiest thing to ask for, and the platform's own team could likely do it without much extra work, even while booking issues stay their priority. It genuinely helps: it turns "just trust us" into "here, look for yourself, at least for your own vote."

It doesn't fully close the gap. You could confirm your own vote — but confirming that *everyone's* votes together add up honestly still depends on trusting the same team, since they'd still be the one showing you the receipt. It's a real improvement, not a complete fix.

**What this means for you:** you'd be able to check your own vote landed correctly. Checking everyone else's would still take someone's word for it.

## One ask, not three

These three aren't rivals — we could ask for #1 and #3 together right now, and stand up #2 in parallel as a trial run, voting there alongside our platform on one real decision, before anyone treats it as official.

Because our platform's own voting tool only offers yes, no or abstain — no way to rank or pick among options — this proposal has to ask one question rather than three: **do we back pursuing all three together?** A "Yes" mandates exploring and running all three in parallel. It does not lock in which one, if any, becomes official — that's a separate decision, later, once we have real results to look at, not guesses.

## What this proposal is not doing

- It is not accusing anyone of rigging a vote. Nothing found here says a result has ever been wrong.
- It is not asking you to distrust the people who built and run our platform. They're doing a genuinely hard job, mostly unpaid attention, spread thin — and they told us the truth about their priorities instead of a comfortable answer.
- It is not asking for a blank check. Tracks 1 and 3 are requests to a team on their own schedule; track 2 costs nothing but time to reactivate, and stays non-binding until a later proposal, informed by real results, says otherwise.
- It is not technical homework for you. If any part of this proposal needs unpacking, that's on the proposal, not on you — say so and it'll get fixed.

## What happens next

Read this, disagree with it, add what's missing — in comments, at the next call, wherever this conversation wants to happen. If a fourth option or a better combination turns up, it goes into the version we actually vote on. This goes to a real vote in the next week or two, through our normal process.

---

The full argument behind this — the code, the transaction data, exactly what does and doesn't get checked today — is in [the governance report](https://claude.ai/artifact/JcAcGuKqtQPsP6vGqbgJbC), finding four. The technical thread, if you want to see the actual working parts, is at [closer-ui #1178](https://github.com/closerdao/closer-ui/issues/1178).

*Made with ❤️ by Gustavito, TDF Citizen & Community Governance Activist.*
*Tell me where this loses you, or where I've got it wrong: [t.me/sepu85](https://t.me/sepu85)*
