# Core Functions

## Attach Builder Code to Order

Include builder index and fee in order parameters.

```typescript
const takerOrderParamsMessage: SignedMsgOrderParamsMessage = {
    signedMsgOrderParams: orderParams,
    subAccountId: 0,
    slot,
    uuid: Uint8Array.from(Buffer.from(nanoid(8))),
    builderIdx: 0,                    // Index of approved builder
    builderFeeTenthBps: 70,           // 0.7% fee (70 * 0.01%)
    takeProfitOrderParams: null,
    stopLossOrderParams: null,
};
```

## Switch Builder Accounts

Change which builder receives fees for future orders.

```typescript
// Remove current builder
await userClient.changeApprovedBuilder(
    userClient.wallet.publicKey,
    builderA.publicKey,
    0,        // Set max fee to 0
    false     // Remove
);

// Add new builder
await userClient.changeApprovedBuilder(
    userClient.wallet.publicKey,
    builderB.publicKey,
    150,      // 1.5% max fee
    true      // Add
);
```

## Revoke/Change Builder Permissions

Update fee limits or remove builder access.

```typescript
// Update fee limit
await userClient.changeApprovedBuilder(
    userClient.wallet.publicKey,
    builder.publicKey,
    200,      // Increase from 150 to 200
    true      // Update existing
);

// Remove builder (fails if open orders exist)
try {
    await userClient.changeApprovedBuilder(
        userClient.wallet.publicKey,
        builder.publicKey,
        0,
        false
    );
} catch (e) {
    assert(e.message.includes('0x18b3')); // CannotRevokeBuilderWithOpenOrders
}
```

## Cancel/Modify Order Flows

Handle order lifecycle with builder codes.

```typescript
// Place order with builder
const orderParams = getMarketOrderParams({
    marketIndex: 0,
    direction: PositionDirection.LONG,
    baseAssetAmount: BASE_PRECISION,
    // ... other params
});

const message = {
    signedMsgOrderParams: orderParams,
    builderIdx: 0,
    builderFeeTenthBps: 50,
    // ... other fields
};

// Cancel order (builder fees are zeroed)
await userClient.cancelOrders();
```

## Multi-Account Builder Interaction

Handle multiple users with different builder approvals.

```typescript
// User A approves Builder 1
await userAClient.changeApprovedBuilder(
    userAClient.wallet.publicKey,
    builder1.publicKey,
    100,
    true
);

// User B approves Builder 2  
await userBClient.changeApprovedBuilder(
    userBClient.wallet.publicKey,
    builder2.publicKey,
    150,
    true
);

// Each user's orders use their approved builder
const userAOrder = { ...orderParams, builderIdx: 0, builderFeeTenthBps: 50 };
const userBOrder = { ...orderParams, builderIdx: 0, builderFeeTenthBps: 75 };
```

## Builder Fee Calculation

Calculate fees based on quote amount and fee basis points.

```typescript
function buildMsg(marketIndex, baseAssetAmount, userOrderId, feeBps, slot) {
    const params = getMarketOrderParams({
        marketIndex,
        direction: PositionDirection.LONG,
        baseAssetAmount,
        // ... other params
    });
    
    return {
        signedMsgOrderParams: params,
        builderIdx: 0,
        builderFeeTenthBps: feeBps,  // Fee in 0.01% increments
        // ... other fields
    };
}

// Usage: 0.7% fee = 70 tenth basis points
const order = buildMsg(0, BASE_PRECISION, 1, 70, slot);
```

## Escrow Account Management

Initialize and resize escrow accounts for order tracking.

```typescript
// Initialize with space for 2 orders
await userClient.initializeRevenueShareEscrow(
    userClient.wallet.publicKey,
    2
);

// Resize to handle more orders
await userClient.resizeRevenueShareEscrowOrders(
    userClient.wallet.publicKey,
    10
);
```

