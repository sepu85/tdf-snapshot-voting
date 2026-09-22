#!/usr/bin/env node
// Independently recompute an address's TDF governance weight, straight from
// Celo — no dependency on Closer's backend or on Snapshot's own indexer.
// Zero npm dependencies: Node 18+'s built-in fetch is all this needs, the
// same raw-JSON-RPC approach tdf-governance-weight's index.html already uses.
//
// Usage:
//   node verify.mjs 0xYourAddressHere
//   node verify.mjs 0xAddr1 0xAddr2 0xAddr3
//
// Prints both FORMULA.md variants for each address, so the result can be
// checked against what a Snapshot proposal (or Closer) reports.

const RPC = 'https://forno.celo.org';

const TOKENS = {
  tdf: '0x10CB7F49389787A99b59B2f87dfDd3bba141559f',
  presence: '0x5Bc8e45E6c0019F12bE2979De614AF3cc63538e9',
  sweat: '0x5D2870B37aB72AB9Cc3F46878373EeCc1312FA6e',
};
const STAKING = '0x475398EeE0E22cb6fe5403ffA294Fb10Ad989e17';

// Function selectors (first 4 bytes of keccak256(signature)) — see
// tdf-governance-weight's index.html for how these were derived/confirmed.
const SEL = {
  balanceOf: '0x70a08231',
  decimals: '0x313ce567',
  stakedBalanceOf: '0x16765391',
};

const padAddr = (addr) => addr.toLowerCase().replace('0x', '').padStart(64, '0');

async function ethCall(to, data) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to, data }, 'latest'],
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`eth_call to ${to} ${data}: ${json.error.message}`);
  return json.result;
}

const toBigInt = (hex) => (hex && hex !== '0x' ? BigInt(hex) : 0n);

async function balanceOf(token, addr) {
  return toBigInt(await ethCall(token, SEL.balanceOf + padAddr(addr)));
}

async function stakedBalanceOf(addr) {
  return toBigInt(await ethCall(STAKING, SEL.stakedBalanceOf + padAddr(addr)));
}

const WAD = 10n ** 18n;
const fmt = (wei) => (Number(wei) / Number(WAD)).toLocaleString('en-US', { maximumFractionDigits: 6 });

async function weightFor(addr) {
  const [tdf, presence, sweat, staked] = await Promise.all([
    balanceOf(TOKENS.tdf, addr),
    balanceOf(TOKENS.presence, addr),
    balanceOf(TOKENS.sweat, addr),
    stakedBalanceOf(addr),
  ]);

  const variant1 = tdf + presence + sweat; // "as production reads it today"
  const variant2 = tdf + staked + presence + sweat; // "whitepaper-aligned / corrected"

  return { tdf, presence, sweat, staked, variant1, variant2 };
}

async function main() {
  const addresses = process.argv.slice(2);
  if (addresses.length === 0) {
    console.error('Usage: node verify.mjs <address> [address2] [address3] ...');
    process.exit(1);
  }

  for (const addr of addresses) {
    if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
      console.error(`Skipping invalid address: ${addr}`);
      continue;
    }

    const w = await weightFor(addr);
    console.log(`\n${addr}`);
    console.log(`  TDF:               ${fmt(w.tdf)}`);
    console.log(`  Staked TDF:        ${fmt(w.staked)}`);
    console.log(`  Presence:          ${fmt(w.presence)}`);
    console.log(`  Sweat:             ${fmt(w.sweat)}`);
    console.log(`  Variant 1 weight (as production reads it): ${fmt(w.variant1)}`);
    console.log(`  Variant 2 weight (whitepaper-aligned):      ${fmt(w.variant2)}`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
