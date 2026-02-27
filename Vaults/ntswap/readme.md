Polls Jupiter every 10s for a dSOL → SOL quote. When the effective swap rate is within
`MAX_SLIPPAGE_BPS` of the oracle price, it executes a Drift swap for `CHUNK_SIZE_DSOL` dSOL.
Repeats until the vault dSOL balance hits 0.

## Setup

Requires Node 18+.

```bash
npm install
```

Fill in `.env` — RPC, Jupiter key, and vault authority are provided by Drift.
Uncomment `PRIVATE_KEY` with your delegate keypair when ready to go live.

## Running

```bash
# scan mode (no PRIVATE_KEY) — logs slippage every 10s, no swaps
npm start

# live mode — add PRIVATE_KEY to .env first
npm start
```

**Example output:**
```
[scan] authority=EuSLjg23... chunk=500 maxSlippage=20bps
connected, polling...

2026-02-27T10:52:08Z bal=3435.92 dSOL  slippage=7.09bps  (swap=1.1758 oracle=1.1766)
  -> within threshold, would swap 500 dSOL [scan mode]
```

The script stops automatically when the dSOL balance reaches 0.
