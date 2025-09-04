# Actions

## Place Orders

### Swift Order (Off-chain routing)

```typescript
import { openPerpOrderTxn, prepSwiftOrder } from 'drift-common';

const swiftOrder = await openPerpOrderTxn({
  driftClient,
  user,
  orderType: 'market',
  useSwift: true,
  swiftParams: {
    currentSlot: 12345,
    isDelegate: false,
    slotBuffer: 2  // buffer for signing time
  },
  marketOrderParams: {
    main: {
      marketIndex: 0,
      direction: PositionDirection.LONG,
      baseAssetAmount: new BN('1000000'), // 1 SOL
    }
  }
});

// Returns: { hexEncodedSwiftOrderMessage, signedMsgOrderUuid, ... }
// Send to Swift server after wallet signing
```

### On-chain Order 

```typescript
// Market/limit orders via regular transaction
const orderTxn = await openPerpOrderTxn({
  driftClient,
  user,
  orderType: 'limit',
  useSwift: false,
  marketOrderParams: {
    main: {
      marketIndex: 0,
      direction: PositionDirection.LONG,
      baseAssetAmount: new BN('1000000'),
      price: new BN('50000000'),  // $50 in price precision
    },
    stopLoss: {  // optional
      triggerPrice: new BN('45000000'),
      baseAssetAmount: new BN('1000000'),
    }
  }
});

// Sign and send transaction
const signature = await wallet.sendTransaction(orderTxn);
```

## Cancel Orders

```typescript
import { createCancelOrdersTxn } from 'drift-common';

const cancelTxn = await createCancelOrdersTxn(
  driftClient,
  user,
  [123, 456, 789], // order IDs to cancel
  { computeUnits: 200000 } // optional tx params
);

await wallet.sendTransaction(cancelTxn);
```

## Edit Orders

```typescript
import { createEditOrderTxn } from 'drift-common';

const editTxn = await createEditOrderTxn(
  driftClient,
  user,
  orderId,
  {
    newBaseAmount: new BN('2000000'),  // double position size
    newLimitPrice: new BN('55000000'), // update limit price
    reduceOnly: true,                  // make reduce-only
  }
);

await wallet.sendTransaction(editTxn);
```

## Spot Operations

### Deposit

```typescript
import { createDepositTxn } from 'drift-common';

const depositTxn = await createDepositTxn({
  driftClient,
  user,
  amount: BigNum.from(1000, 6), // 1000 USDC (6 decimals)
  spotMarketConfig: Config.spotMarketsLookup[0], // USDC
  isMaxBorrowRepayment: false, // or true to repay max borrow
});

await wallet.sendTransaction(depositTxn);
```

### Withdraw

```typescript
import { createWithdrawTxn } from 'drift-common';

const withdrawTxn = await createWithdrawTxn({
  driftClient,
  user,
  amount: BigNum.from(500, 6), // 500 USDC
  spotMarketConfig: Config.spotMarketsLookup[0],
  isMaxWithdraw: false, // or true for max available
});

await wallet.sendTransaction(withdrawTxn);
```

## User Management

### Create User Account

```typescript
import { createUserAccountAndDepositTxn } from 'drift-common';

const createTxn = await createUserAccountAndDepositTxn({
  driftClient,
  amount: new BN('1000000000'), // 1000 USDC
  spotMarketConfig: Config.spotMarketsLookup[0],
  authority: wallet.publicKey,
  userStatsAccount: undefined, // will be created
  referrerName: 'referrer_code', // optional
  accountName: 'Main Account',   // optional
  poolId: MAIN_POOL_ID,         // optional
});

await wallet.sendTransaction(createTxn);
```

## Built-in Validation

All action helpers include validation:

- **Order validation**: Size limits, market status checks
- **Balance validation**: Sufficient collateral for deposits/withdraws  
- **Account validation**: User account exists, proper authority
- **Swift validation**: Order type support, slot timing

Transaction building automatically handles:
- Compute unit estimation
- Priority fee calculation  
- Account lookups and resolving
- Instruction ordering

## Central Server Actions

For API servers, use `CentralServerDrift` to create transactions for any user:

### Server-Side Order Placement

```typescript
import { CentralServerDrift } from 'drift-common';

const centralClient = new CentralServerDrift({
  solanaRpcEndpoint: rpcUrl,
  driftEnv: 'mainnet-beta',
});

// Create perp order for any user (no wallet required)
const orderTxn = await centralClient.getOpenPerpMarketOrderTxn(
  userAccountPublicKey,
  {
    direction: PositionDirection.LONG,
    baseAssetAmount: new BN('1000000'),
    marketIndex: 0,
  }
);

// Returns VersionedTransaction ready for user signature
return orderTxn;
```

### Available Central Client Methods

```typescript
// Spot operations
await centralClient.getDepositTxn(userPubkey, depositParams);
await centralClient.getWithdrawTxn(userPubkey, withdrawParams);

// Perp operations  
await centralClient.getOpenPerpMarketOrderTxn(userPubkey, orderParams);
await centralClient.getOpenPerpNonMarketOrderTxn(userPubkey, orderParams);
await centralClient.getSettleFundingTxn(userPubkey, marketIndex);
await centralClient.getSettlePnlTxn(userPubkey, settlePnlParams);

// Order management
await centralClient.getEditOrderTxn(userPubkey, orderId, editParams);
await centralClient.getCancelOrdersTxn(userPubkey, orderIds);
await centralClient.getCancelAllOrdersTxn(userPubkey, marketType, marketIndex);

// Trading
await centralClient.getSwapTxn(userPubkey, swapParams);
```

### Central Client Benefits

- **No wallet required** - Uses placeholder wallet for market subscriptions
- **On-demand user data** - Fetches user accounts only when creating transactions
- **Automatic cleanup** - Handles user subscription/unsubscription automatically
- **Multi-user support** - Can create transactions for any user account
