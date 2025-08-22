import { Connection } from '@solana/web3.js';
import { Buffer } from 'buffer';

// ---- RPC ----
const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=KEYHERE",
  'confirmed'
);

const fetchJson = async <T>(url: string, init?: RequestInit) =>
  (await (await fetch(url, init)).json()) as T;

//add your sanctum key here
const getSanctumYields = async () => {
  const { apys } = await fetchJson<{ apys?: Record<string, number> }>(
    'https://SANCTUM KEY HERE/lst=jitoSOL&lst=mSOL&lst=INF&lst=dSOL&lst=dfdvSOL'
  );
  return apys ?? {};
};

const getExponentYields = async () => {
  const { data } = await fetchJson<{
    data?: Array<{
      stats?: { underlyingYieldsPct?: number | null; ytImpliedRateAnnualizedPct?: number | null };
      metadata?: { ptTicker?: string };
    }>;
  }>('https://web-api.exponent.finance/api/markets');

  let kySol = 0, fragSol = 0;
  data?.forEach((m) => {
    const ticker = m.metadata?.ptTicker?.toLowerCase() ?? '';
    const rate =
      m.stats?.ytImpliedRateAnnualizedPct ??
      m.stats?.underlyingYieldsPct ??
      0;
    if (ticker.includes('kysol')) kySol = rate * 100;
    if (ticker.includes('fragsol')) fragSol = rate * 100;
  });
  return { kySol, fragSol };
};

const getJlpYield = async (conn: Connection) => {
  const PROGRAM = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5cVBadZi5';
  const rpc = await fetchJson<{
    result?: { value?: { data?: [string, string] | null } | null } | null;
  }>(conn.rpcEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [PROGRAM, { encoding: 'base64' }],
    }),
  });

  const pair = rpc.result?.value?.data;
  if (!pair || pair[1] !== 'base64') return 0;
  const buf = Buffer.from(pair[0], 'base64');
  let offset = 8 + 100;
  if (offset + 4 > buf.length) return 0;
  const feeAprBps = buf.readUInt32LE(offset);
  return feeAprBps / 100;
};

const run = async () => {
  try {
    const [sanctum, exponent, jlp] = await Promise.all([
      getSanctumYields(),
      getExponentYields(),
      getJlpYield(connection),
    ]);

    const yields = {
      jitoSOL: (sanctum.jitoSOL ?? 0) * 100,
      mSOL: (sanctum.mSOL ?? 0) * 100,
      dSOL: (sanctum.dSOL ?? 0) * 100,
      INF: (sanctum.INF ?? 0) * 100,
      dfdvSOL: (sanctum.dfdvSOL ?? 0) * 100,
      kySOL: exponent.kySol,
      fragSOL: exponent.fragSol,
      JLP: jlp,
    };

    for (const [k, v] of Object.entries(yields)) {
      console.log(`${k}: ${v.toFixed(2)}%`);
    }
  } catch (err) {
    console.error('Error fetching yields:', err);
  }
};

await run();
