# Phase 1 — proposed closer-ui patch (reference only, not yet applied)

Structured, wallet-signed, IPFS-published vote receipts. See [`ipfs-design.md`](./ipfs-design.md) for the full design and reasoning. This is the exact starting point for the real PR — nothing here has been applied to `closer-ui` yet.

**Targets the real vote flow.** An earlier version of this idea (from an independent proposal by another community member) targeted `packages/closer/components/Governance/VoteModal.tsx`. That component is unused — not imported by `pages/governance/[slug].tsx` or anywhere else in the app. The actual vote-casting logic is `handleVote`, inside `[slug].tsx` itself. Everything below targets that.

## New file: `packages/closer/utils/ipfsVote.helpers.ts`

```ts
// Builds the structured vote payload and publishes it to IPFS, kept
// separate from handleVote's own logic. Publishing is best-effort: a
// pinning-provider outage must never block a vote.

export type VotePayload = {
  proposalId: string;
  vote: 'yes' | 'no' | 'abstain';
  weight: number;
  votedAt: string; // ISO-8601
};

export const buildVotePayload = (
  proposalId: string,
  vote: 'yes' | 'no' | 'abstain',
  weight: number,
): VotePayload => ({
  proposalId,
  vote,
  weight,
  votedAt: new Date().toISOString(),
});

export type PublishResult =
  | { published: true; cid: string; gatewayUrl: string }
  | { published: false; reason: string };

const PINNING_ENDPOINT = process.env.IPFS_PINNING_ENDPOINT;
const PINNING_TOKEN = process.env.NEXT_PUBLIC_IPFS_PINNING_TOKEN;

/**
 * Publishes { payload, signature, signerAddress } to IPFS. Never throws -
 * a failure here must never look like a failed vote to the caller.
 */
export const publishVoteToIPFS = async (
  payload: VotePayload,
  signature: string,
  signerAddress: string,
): Promise<PublishResult> => {
  if (!PINNING_ENDPOINT || !PINNING_TOKEN) {
    return { published: false, reason: 'ipfs_not_configured' };
  }

  try {
    const body = JSON.stringify({ payload, signature, signerAddress });

    // NOTE: request shape below matches a generic pinning-provider upload
    // API (e.g. web3.storage's simple upload endpoint). Confirm against
    // whichever provider is actually chosen before merging - providers
    // differ on auth header name and response field names.
    const response = await fetch(PINNING_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINNING_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      return { published: false, reason: `ipfs_http_${response.status}` };
    }

    const { cid } = await response.json();

    return {
      published: true,
      cid,
      gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
    };
  } catch (err) {
    return {
      published: false,
      reason: err instanceof Error ? err.message : 'ipfs_unknown_error',
    };
  }
};
```

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

Proposed change:

```diff
+import { buildVotePayload, publishVoteToIPFS } from '../../utils/ipfsVote.helpers';
+
   // Create vote signature hash
   const voteSignatureHash = createVoteSignatureHash(
     currentProposal.description,
     selectedVote,
   );

-  // In a real implementation, this would sign a message with the wallet
-  // and submit the vote to Snapshot or a similar platform
-  const message = `I am voting ${selectedVote} on proposal ${currentProposal._id}`;
-  const signature = await signMessage(message, account);
+  const voteAmount = Math.min(selectedVoteAmount, remainingVoteWeight);
+  const votePayload = buildVotePayload(currentProposal._id, selectedVote, voteAmount);
+  const message = JSON.stringify(votePayload);
+  const signature = await signMessage(message, account);

   if (!signature) {
     throw new Error(t('governance_failed_sign_vote'));
   }

-  // Create vote data with signature hash
-  const voteAmount = Math.min(selectedVoteAmount, remainingVoteWeight);
+  // Best-effort: never blocks the vote below on failure.
+  const publishResult = await publishVoteToIPFS(votePayload, signature, account);
+  setVoteReceipt(publishResult); // new local state - drives the confirmation UI
+
   const voteData = {
     votingWeight: voteAmount,
     signature: voteSignatureHash,
     vote: selectedVote,
+    // Additive fields (RFC #<n>). closer-api does not verify or store these
+    // yet - sending them now is non-breaking and lets backend adoption land
+    // as a fully separate, independent change.
+    voterAddress: account,
+    walletSignature: signature,
+    signedMessage: message,
+    ...(publishResult.published ? { cid: publishResult.cid } : {}),
   };
```

The `castVote` object built a few lines later from the same data (used for local optimistic state) should get the same fields added:

```diff
   const castVote: ProposalVote = {
     userId: user?._id || '',
     signature: voteSignatureHash,
     weight: voteAmount,
     votedAt: new Date().toISOString(),
+    voterAddress: account,
+    walletSignature: signature,
+    ...(publishResult.published ? { cid: publishResult.cid } : {}),
   };
```

Somewhere in the confirmation UI (`showVoteSuccess` block), render `voteReceipt`: the CID + gateway link when `published: true`, or a quiet "not published to IPFS this time" note when `false` — never a blocking error.

## `packages/closer/types/proposal.ts`

```diff
 export type ProposalVote = {
   userId: string;
   signature: string;
   weight: number;
   votedAt: Date | string;
+  /** The connected wallet address that cast this vote. Sent since RFC #<n>;
+   * not yet verified server-side. */
+  voterAddress?: string;
+  /** Real wallet `personal_sign` signature over `signedMessage`. Sent
+   * additively; closer-api does not verify it yet. */
+  walletSignature?: string;
+  /** The exact JSON string `walletSignature` was produced over. */
+  signedMessage?: string;
+  /** IPFS CID of the published { payload, signature, signerAddress }
+   * record, if publishing succeeded. Absent for votes cast before this
+   * shipped, or when the pinning provider was unreachable. */
+  cid?: string;
 };
```

## What this does *not* do

- Does not change `voteSignatureHash`/`createVoteSignatureHash` — the existing fake hash still gets sent unchanged, so whatever closer-api currently validates keeps working.
- Does not require closer-api to do anything. The IPFS publish happens entirely client-side, to a third-party pinning service — the vote receipt exists and is independently verifiable regardless of what closer-api does with the additive POST fields.
- Does not touch `VoteModal.tsx` in this patch — flag separately whether to fix its identical discard-the-signature bug or remove it as dead code.

## Testing

- Unit tests for `ipfsVote.helpers.ts`: `buildVotePayload` shape, `publishVoteToIPFS` returning `{published:false}` on network failure/missing config without throwing.
- No changes needed to `proposalProofs.test.ts`/`proposalAttestation.test.ts` (leaf/digest format untouched).
- Extend whatever test covers `handleVote`'s POST payload to assert the new additive fields, including `cid` when publish succeeds and its absence when it doesn't.
