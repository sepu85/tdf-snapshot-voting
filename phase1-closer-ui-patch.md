# Option A, Phase 1 — proposed closer-ui patch (reference only, not yet applied)

This is the exact, minimal diff for Phase 1 of [`RFC-DRAFT.md`](./RFC-DRAFT.md): stop discarding the real wallet signature `handleVote` already obtains, and send it — additively — alongside the existing (unchanged) fake hash. Nothing here has been applied to `closer-ui` yet; it's a concrete starting point for whoever picks up the RFC.

Every line number and surrounding code below was read directly from `closerdao/closer-ui`'s current `packages/closer/pages/governance/[slug].tsx` and `packages/closer/types/proposal.ts`.

## `packages/closer/pages/governance/[slug].tsx`

Current code (lines ~443–464):

```ts
// Create vote signature hash
const voteSignatureHash = createVoteSignatureHash(
  currentProposal.description,
  selectedVote,
);

// In a real implementation, this would sign a message with the wallet
// and submit the vote to Snapshot or a similar platform
const message = `I am voting ${selectedVote} on proposal ${currentProposal._id}`;
const signature = await signMessage(message, account);

if (!signature) {
  throw new Error(t('governance_failed_sign_vote'));
}

// Create vote data with signature hash
const voteAmount = Math.min(selectedVoteAmount, remainingVoteWeight);
const voteData = {
  votingWeight: voteAmount,
  signature: voteSignatureHash,
  vote: selectedVote,
};
```

Note the existing comment on the `signMessage` line — the team's own code already says "this would sign a message with the wallet **and submit the vote to Snapshot or a similar platform**." This patch is that comment, implemented.

Proposed change — keep everything as-is, add two fields:

```diff
   // Create vote signature hash
   const voteSignatureHash = createVoteSignatureHash(
     currentProposal.description,
     selectedVote,
   );

-  // In a real implementation, this would sign a message with the wallet
-  // and submit the vote to Snapshot or a similar platform
   const message = `I am voting ${selectedVote} on proposal ${currentProposal._id}`;
   const signature = await signMessage(message, account);

   if (!signature) {
     throw new Error(t('governance_failed_sign_vote'));
   }

   // Create vote data with signature hash
   const voteAmount = Math.min(selectedVoteAmount, remainingVoteWeight);
   const voteData = {
     votingWeight: voteAmount,
     signature: voteSignatureHash,
     vote: selectedVote,
+    // Additive fields (RFC #<n>): the real wallet signature, previously
+    // obtained and discarded. closer-api does not verify these yet — sending
+    // them now is non-breaking and lets backend verification land as a
+    // separate, independent change.
+    voterAddress: account,
+    walletSignature: signature,
+    signedMessage: message,
   };
```

The `castVote` object built a few lines later from the same data (used for local optimistic state) should get the same three fields added, for consistency:

```diff
   const castVote: ProposalVote = {
     userId: user?._id || '',
     signature: voteSignatureHash,
     weight: voteAmount,
     votedAt: new Date().toISOString(),
+    voterAddress: account,
+    walletSignature: signature,
   };
```

## `packages/closer/types/proposal.ts`

```diff
 export type ProposalVote = {
   userId: string;
   signature: string;
   weight: number;
   votedAt: Date | string;
+  /** The connected wallet address that cast this vote. Sent by the client
+   * since RFC #<n>; not yet verified server-side. */
+  voterAddress?: string;
+  /** Real wallet `personal_sign` signature over `signedMessage`, obtained but
+   * previously discarded. Sent additively; closer-api does not verify it yet. */
+  walletSignature?: string;
+  /** The exact message `walletSignature` was produced over. */
+  signedMessage?: string;
 };
```

## What this does *not* do

- Does not change `voteSignatureHash`/`createVoteSignatureHash` (`utils/crypto.ts`) — the existing fake hash still gets sent, so closer-api's current validation (whatever it is) keeps working unmodified.
- Does not verify anything server-side — that's `closer-api`, private, out of scope for this repo and this patch. A PR built from this patch should say so explicitly in its description.
- Does not touch `packages/closer/components/Governance/VoteModal.tsx`, which has the identical discard-the-signature bug but is currently unused/orphaned — call out in the same PR whether to fix it for consistency or flag it as dead code.

## Testing

No changes needed to `proposalProofs.test.ts` or `proposalAttestation.test.ts` (leaf/digest format is untouched). Add an assertion to whatever test covers `handleVote`'s POST payload, confirming `voterAddress`, `walletSignature`, and `signedMessage` are present alongside the unchanged `signature` field.
