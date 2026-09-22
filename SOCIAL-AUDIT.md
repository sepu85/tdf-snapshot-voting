# A social voting-audit process (no-code alternative)

This is the cheapest, fastest option in this repo: a human-process check that requires no new platform and no code, and can start immediately regardless of what happens with Options A or B.

## What it is

A rotating, community-elected panel of "vote witnesses" who, for every finalized proposal, independently verify the published tally using only publicly available means — the same techniques used to produce the findings this repo is based on.

## How to set it up

1. **Bring a TDF proposal** establishing a rotating **Governance Audit Committee**: 3–5 members, elected or volunteer, serving fixed terms. Explicitly exclude the Closer admin, and require any auditor with a personal stake in a specific proposal to recuse from auditing that one.
2. **For each finalized proposal**, every sitting auditor independently:
   - Opens the proposal page and inspects the underlying vote data. In a browser: open DevTools → Console, and run
     ```js
     window.__NEXT_DATA__.props.pageProps.proposal
     ```
     to see the full per-vote list (weight, choice, timestamp) the page already has client-side but doesn't display.
   - Spot-checks a random sample of voters' weights against live on-chain balances, e.g. with this repo's [`verify.mjs`](./verify.mjs) or the [`tdf-governance-weight`](https://github.com/sepu85/tdf-governance-weight) dashboard.
   - Independently recomputes the published proof digest (the page's own "Verify" panel already does this client-side — an auditor is just repeating that check deliberately, on a schedule, instead of leaving it to whoever happens to look).
3. **Each auditor publishes a short, wallet-signed statement** in a public community channel (or as a comment on the proposal) confirming or disputing the match. A statement is signed so it can't be forged or quietly altered later.
4. The resulting public log becomes a standing community audit trail, alongside — not instead of — the existing on-chain digest.

## Risks and limits — stated plainly, not glossed over

- **Still trust-based, not cryptographic.** This distributes single-point-of-trust risk across several people; it does not eliminate it the way real per-vote wallet signatures would.
- **Same upstream data-source problem.** Auditors are still reading whatever Closer's backend serves. If that source were compromised or wrong before publication, several honest auditors reading the same compromised feed could all sign off on the same wrong result.
- **Collusion and pressure risk.** Any small elected group can be pressured, bribed, or quietly aligned. Mitigate with rotation, public terms, majority-not-unanimity results (so a lone dissent is visible rather than suppressed), and a hard exclusion rule for conflicted individuals.
- **Doesn't scale to full coverage.** Manually re-checking every voter on a large proposal isn't realistic; sampling gives partial, not total, confidence. Say this in every published attestation — "we checked N of M voters," never an unqualified "verified."
- **No defined remedy today.** If auditors disagree with a published result, there's currently no agreed process for what happens next (a re-vote? a public dispute mechanism?). This needs its own decision before the committee is stood up, not after the first disagreement.
- **Ongoing overhead.** Someone has to actually do this, every proposal, indefinitely. Lower cost than building or maintaining Snapshot infrastructure or backend changes, but not free.

## Why do this regardless of A or B

It's nearly free to start, doesn't require anyone's cooperation outside the TDF community itself, and adds a real, visible check today — while Option A (fixing Closer) and Option B (Snapshot) each take longer to land.
