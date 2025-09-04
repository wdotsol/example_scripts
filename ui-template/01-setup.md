# Setup

## Install

```bash
npm install drift-common
```

## Packages

```typescript
import { Initialize, Config } from 'drift-common';
import { DriftClient, initialize, DriftEnv } from '@drift-labs/sdk';
import { Connection, PublicKey } from '@solana/web3.js';

// 1. Initialize config
const driftEnv: DriftEnv = 'mainnet-beta'; // or 'devnet' 
const config = Initialize(driftEnv);
```

## DriftClient Setup

```typescript
// 2. Create connection and client
const connection = new Connection('https://api.mainnet-beta.solana.com');
const driftClient = new DriftClient({
  connection,
  env: driftEnv,
  userStats: true,
  // add your wallet here
});

await driftClient.subscribe();
```

## User Instance Setup

Most data reading functions require a `User` instance:

```typescript
import { User } from '@drift-labs/sdk';

// 3. Create user instance for a specific drift account
const user = new User({
  driftClient,
  userAccountPublicKey: userAccountPubkey, // the drift account address
});

await user.subscribe();
```

Now you can access user data:
```typescript
const perpPositions = user.getPerpPositions();
const spotPositions = user.getSpotPositions();
const tokenAmount = user.getTokenAmount(marketIndex);
```

## RPC Endpoints

Use the pre-configured endpoints from `EnvironmentConstants`:

```typescript
import { EnvironmentConstants } from 'drift-common';

const endpoints = EnvironmentConstants.rpcs.mainnet; 
// [{ label: 'Triton RPC Pool 1', value: 'https://drift-drift-951a.mainnet.rpcpool.com', ... }]

const connection = new Connection(endpoints[0].value);
```

## Check Initialization

```typescript
if (!Config.initialized) {
  throw new Error('Config not initialized. Call Initialize(env) first.');
}

// Access market configs
const perpMarkets = Config.perpMarketsLookup;
const spotMarkets = Config.spotMarketsLookup;
```

## Central Server Client (Alternative)

For API servers that need to handle multiple users, use `CentralServerDrift` instead:

```typescript
import { CentralServerDrift } from 'drift-common';

// 4. Central server setup - no user wallet required
const centralClient = new CentralServerDrift({
  solanaRpcEndpoint: 'https://api.mainnet-beta.solana.com',
  driftEnv: 'mainnet-beta',
  additionalDriftClientConfig: {
    txVersion: 0,
    txParams: {
      computeUnits: 200000,
      computeUnitsPrice: 1000,
    },
  },
});

await centralClient.subscribe(); // Subscribes to market data only
```

### Creating Transactions for Any User

```typescript
// Create transactions for any user account without pre-subscribing
const depositTxn = await centralClient.getDepositTxn(
  userAccountPublicKey, // any drift account
  {
    amount: BigNum.from(1000, 6), // 1000 USDC
    spotMarketConfig: Config.spotMarketsLookup[0],
  }
);

const perpOrderTxn = await centralClient.getOpenPerpMarketOrderTxn(
  userAccountPublicKey,
  {
    direction: PositionDirection.LONG,
    baseAssetAmount: new BN('1000000'), // 1 SOL
    marketIndex: 0,
  }
);

// Returns VersionedTransaction ready for user to sign
```

### Key Differences

| Feature | DriftClient + User | CentralServerDrift |
|---------|-------------------|-------------------|
| **Use case** | Single user apps | API servers |
| **Setup** | Requires wallet | Uses placeholder wallet |
| **User data** | Pre-subscribe per user | Fetch on-demand |
| **Market data** | Subscribe manually | Auto-subscribed |
| **Transactions** | Build with wallet | Build for any user |
