# NT vault dSOL → SOL swap script

Polls Jupiter every 10s for a dSOL → SOL quote. When the effective swap rate is within
`MAX_SLIPPAGE_BPS` of the oracle price, it executes a Drift swap for `CHUNK_SIZE_DSOL` dSOL.
Repeats until the vault dSOL balance hits 0.

## Setup

Requires Node 18+.

```bash
npm install
```

## .env

```bash
#do not share
RPC_ENDPOINT=...
JUPITER_API_KEY=...
VAULT_AUTHORITY=...

# tuning — adjust these as needed
MAX_SLIPPAGE_BPS=20    # max slippage vs oracle (bps). 20 = 0.20%. lower = more selective
CHUNK_SIZE_DSOL=500    # dSOL to swap per pass. smaller = less market impact per tx
SLEEP_MS=10000         # ms between polls. 10000 = check every 10s
```

## Running

```bash
# scan mode — logs slippage every 10s, no swaps (safe to leave running)
npm start

# live mode — uncomment PRIVATE_KEY in .env first, then:
npm start
```

**Example output:**
```
[scan] authority=EuSLjg23... chunk=500 maxSlippage=20bps
connected, polling...

2026-02-27T10:52:08Z bal=3435.92 dSOL  slippage=7.09bps  (swap=1.1758 oracle=1.1766)
  -> within threshold, would swap 500 dSOL [scan mode]

2026-02-27T10:52:23Z bal=3435.92 dSOL  slippage=36.51bps  (swap=1.1757 oracle=1.1800)
```

Slippage fluctuates throughout the day — the script will automatically swap when it dips below `MAX_SLIPPAGE_BPS` and skip when it's too high. Stops automatically when dSOL balance hits 0.
