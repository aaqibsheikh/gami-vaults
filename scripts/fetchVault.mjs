#!/usr/bin/env node

// Simple script to fetch vault data via our Next.js API and log it
// Usage:
//   node scripts/fetchVault.mjs --address 0x... --chain 1 --provider lagoon [--base http://localhost:3000]

const args = process.argv.slice(2);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

const opts = parseArgs(args);
const address = (opts.address || opts.addr || '').toString();
const chainId = Number(opts.chain || opts.chainId || 1);
const provider = (opts.provider || '').toString();
const base = (opts.base || process.env.BASE_URL || 'http://localhost:3000').toString();

if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
  console.error('Error: --address must be a valid 0x-prefixed 20-byte hex.');
  process.exit(1);
}
if (!Number.isFinite(chainId) || chainId <= 0) {
  console.error('Error: --chain must be a positive integer (e.g., 1).');
  process.exit(1);
}

async function main() {
  const url = `${base}/api/vaults/${chainId}/${address}`;
  console.log(`[fetchVault] GET ${url}`);
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[fetchVault] HTTP ${res.status}: ${text}`);
    process.exit(2);
  }
  const json = await res.json();

  if (provider && json.provider && json.provider !== provider) {
    console.warn(`[fetchVault] Provider mismatch: requested='${provider}' received='${json.provider}'`);
  }

  // Pretty print a concise summary
  const summary = {
    id: json.id,
    chainId: json.chainId,
    name: json.name,
    provider: json.provider,
    symbol: json.symbol,
    tvlUsd: json.tvlUsd,
    apyNet: json.apyNet,
    underlying: json.underlying,
    status: json.status,
    metadata: json.metadata,
    fees: json.fees,
    rewards: json.rewards,
  };

  console.log('[fetchVault] Summary:');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error('[fetchVault] Uncaught error:', err?.stack || err?.message || String(err));
  process.exit(3);
});


