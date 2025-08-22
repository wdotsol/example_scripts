import { Connection, PublicKey } from "@solana/web3.js";
import { BorshCoder, type Idl } from "@coral-xyz/anchor";

//make sure to add your api / rpc here
const RPC_URL = process.env.RPC_URL || "https://mainnet.helius-rpc.com/?api-key=key here";
const SANCTUM_ENDPOINT =
  process.env.SANCTUM_ENDPOINT ||
  "https://api here lst=jitoSOL&lst=mSOL&lst=INF&lst=dSOL&lst=dfdvSOL";
const EXPONENT_URL = "https://web-api.exponent.finance/api/markets";
const JLP_POOL = new PublicKey("5BUwFW4nRbftYTDMbgxykoFWqWHPzahFSNAaaaJtVKsq");
const IDL_URL =
  "https://raw.githubusercontent.com/julianfssen/jupiter-perps-anchor-idl-parsing/main/src/idl/jupiter-perpetuals-idl-json.json";

const conn = new Connection(RPC_URL, "confirmed");

const fetchJson = async <T>(url: string, init?: RequestInit) =>
  (await (await fetch(url, init)).json()) as T;

const compoundToAPY = (aprPct: number, n = 365) =>
  (Math.pow(1 + aprPct / 100 / n, n) - 1) * 100;

async function getSanctumYields() {
  try {
    const { apys } = await fetchJson<{ apys?: Record<string, number> }>(SANCTUM_ENDPOINT);
    return apys ?? {};
  } catch {
    return {};
  }
}

async function getExponentYields() {
  try {
    const { data } = await fetchJson<{
      data?: Array<{
        stats?: { underlyingYieldsPct?: number | null; ytImpliedRateAnnualizedPct?: number | null };
        metadata?: { ptTicker?: string };
      }>;
    }>(EXPONENT_URL);

    let kySol = 0, fragSol = 0;
    for (const m of data ?? []) {
      const t = (m.metadata?.ptTicker ?? "").toLowerCase();
      const r =
        m.stats?.ytImpliedRateAnnualizedPct ??
        m.stats?.underlyingYieldsPct ??
        0;
      if (t.includes("kysol")) kySol = r * 100;
      if (t.includes("fragsol")) fragSol = r * 100;
    }
    return { kySol, fragSol };
  } catch {
    return { kySol: 0, fragSol: 0 };
  }
}

async function getJlpApr() {
  const idl = await fetchJson<Idl>(IDL_URL);
  const coder = new BorshCoder(idl);
  const info = await conn.getAccountInfo(JLP_POOL);
  if (!info?.data) throw new Error("Pool account not found");
  let acc: any;
  try {
    acc = coder.accounts.decode("pool", info.data);
  } catch {
    acc = coder.accounts.decode("Pool", info.data);
  }
  const v = acc?.poolApr?.feeAprBps;
  if (v == null) throw new Error("feeAprBps missing on Pool account");
  const bps =
    typeof v === "number" ? v :
    typeof v === "bigint" ? Number(v) :
    typeof v?.toNumber === "function" ? v.toNumber() :
    Number(v?.toString?.() ?? 0);
  return bps / 100;
}

async function run() {
  try {
    const [sanctum, exponent, jlpApr] = await Promise.all([
      getSanctumYields(),
      getExponentYields(),
      getJlpApr(),
    ]);

    const yields: Record<string, number> = {
      jitoSOL: (sanctum.jitoSOL ?? 0) * 100,
      mSOL: (sanctum.mSOL ?? 0) * 100,
      dSOL: (sanctum.dSOL ?? 0) * 100,
      INF: (sanctum.INF ?? 0) * 100,
      dfdvSOL: (sanctum.dfdvSOL ?? 0) * 100,
      kySOL: exponent.kySol,
      fragSOL: exponent.fragSol,
      JLP_APR: jlpApr,
      JLP_APY: compoundToAPY(jlpApr),
    };

    for (const k of ["jitoSOL","mSOL","dSOL","INF","dfdvSOL","kySOL","fragSOL","JLP_APR","JLP_APY"]) {
      console.log(`${k}: ${yields[k].toFixed(2)}%`);
    }
  } catch (e) {
    console.error("Error:", e);
    process.exitCode = 1;
  }
}

run();
