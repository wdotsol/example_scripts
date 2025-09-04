# Drift Common - Builder Guide

`drift-common` is a TypeScript package that provides **UI data** and **actions** for Drift. Whether you're building a trading interface, API service, or analytics dashboard, this package gives you the tools to integrate with Drift.

## What is drift-common?

Instead of working directly with raw Solana accounts and our SDK's, `drift-common` provides:

- **UI data:** Positions, balances, PnL with proper formatting
- **Drift actions:**  Place orders, manage positions with one function call  
- **Validation checks:**  Order size limits, market status, balance checks
- **Drift central client:** Standard client for apps, central client for servers

**Drift-common** sits between your application and the SDK's.

## Quick Example

```typescript
import { getOpenPositionData, createOpenPerpOrderTxn } from 'drift-common';

// Read position data (UI-ready)
const position = getOpenPositionData(user, 0); // SOL-PERP
console.log(`PnL: $${position.unrealizedPnl.toFixed(2)}`);
console.log(`Size: ${position.baseAssetAmount.toFixed(4)} SOL`);

// Place an order (one function call)
const orderTxn = await createOpenPerpOrderTxn(driftClient, user, {
  direction: PositionDirection.LONG,
  baseAssetAmount: new BN('1000000'), // 1 SOL
  marketIndex: 0,
});
```

## Two Client Types

### Standard Client (Apps)
```typescript
// For wallet-connected applications
const driftClient = new DriftClient(config);
const user = new User({ driftClient, userAccountPublicKey });
await user.subscribe();

// Now read data and create transactions
const positions = getOpenPositionData(user, marketIndex);
```

### Central Client

**CentralServerDrift** is built for API servers and backends that need to create transactions for multiple users without wallet connections. It subscribes to market data (no user accounts) and generates transaction instructions that users can sign elsewhere.

```typescript
// For API servers handling multiple users
const centralClient = new CentralServerDrift(config);
await centralClient.subscribe(); // market data only

// Create transactions for any user (no wallet needed)
const orderTxn = await centralClient.getOpenPerpOrderTxn(userPubkey, params);
```

## Getting Started

Ready to start building? Head to **[Setup](01-setup.md)** to get your first Drift integration running in minutes.

*Drift Common also powers Drift's own trading interface and is maintained by the Drift team.*
