# Advanced Functions

## Settlement and Fee Sweeping

Fees are automatically swept to builders during PNL settlement.

```typescript
// Fees accumulate in escrow during fills
const escrow = await escrowMap.mustGet(userClient.wallet.publicKey.toBase58());
const builderOrder = escrow.orders.find(o => o.builderIdx === 0);
assert(builderOrder.feesAccrued.gt(ZERO));

// Settle PNL to sweep fees to builder
const settleTx = await builderClient.settlePNL(
    await userClient.getUserAccountPublicKey(),
    userClient.getUserAccount(),
    marketIndex,
    undefined,
    undefined,
    escrowMap  // Required for fee processing
);

// Verify fees swept and escrow zeroed
await escrowMap.slowSync();
const escrowAfterSettle = await escrowMap.mustGet(userClient.wallet.publicKey.toBase58());
for (const order of escrowAfterSettle.orders) {
    assert(order.feesAccrued.eq(ZERO));
}
```

## Multi-Market Fee Tracking

Builder fees are tracked per market and order independently.

```typescript
// Place orders on different markets with same builder
const order0 = buildMsg(0, BASE_PRECISION, 1, 50, slot);  // Market 0
const order1 = buildMsg(1, BASE_PRECISION, 2, 75, slot);  // Market 1

// Each order tracks fees separately in escrow
const escrow = await escrowMap.mustGet(userClient.wallet.publicKey.toBase58());
const market0Order = escrow.orders.find(o => o.marketIndex === 0);
const market1Order = escrow.orders.find(o => o.marketIndex === 1);

// Fees can be different per market
assert(market0Order.feesAccrued.eq(market0Fee));
assert(market1Order.feesAccrued.eq(market1Fee));
```

## Referrer + Builder Fee Combination

Users can earn both referrer rewards and pay builder fees.

```typescript
// User has referrer (earns rewards) and builder (pays fees)
const userClient = new TestClient({
    // ... config
    referrer: await builderClient.getUserAccountPublicKey(),
    referrerStats: builderClient.getUserStatsAccountPublicKey(),
});

// Place order with builder code
const order = {
    signedMsgOrderParams: orderParams,
    builderIdx: 0,
    builderFeeTenthBps: 70,
    // ... other fields
};

// Fill order - both referrer reward and builder fee accrue
const fillTx = await makerClient.fillPerpOrder(
    await userClient.getUserAccountPublicKey(),
    userClient.getUserAccount(),
    { marketIndex, orderId: 3 },
    undefined,
    {
        referrer: await builderClient.getUserAccountPublicKey(),
        referrerStats: builderClient.getUserStatsAccountPublicKey(),
    }
);

// Verify both fees accrued
const events = parseLogs(builderClient.program, logs);
const fillEvent = events.find(e => e.name === 'OrderActionRecord');
assert(fillEvent.data.referrerReward.gt(ZERO));  // Referrer reward
assert(fillEvent.data.builderFee.gt(ZERO));      // Builder fee
```

## Builder Fee Validation

Protocol enforces user-approved fee limits.

```typescript
// User approves builder with 1.5% max fee
await userClient.changeApprovedBuilder(
    userClient.wallet.publicKey,
    builder.publicKey,
    150,  // 1.5% max
    true
);

// Try to place order with 2% fee (should fail)
const highFeeOrder = {
    signedMsgOrderParams: orderParams,
    builderIdx: 0,
    builderFeeTenthBps: 200,  // 2% > 1.5% max
    // ... other fields
};

try {
    await builderClient.placeSignedMsgTakerOrder(/* ... */);
    assert(false, 'Should have thrown InvalidBuilderFee');
} catch (e) {
    assert(e.message.includes('InvalidBuilderFee'));
}
```

## Escrow Account Resizing

Escrow accounts can be dynamically resized to handle more orders.

```typescript
// Start with space for 2 orders
await userClient.initializeRevenueShareEscrow(
    userClient.wallet.publicKey,
    2
);

// Verify initial size
let escrow = await escrowMap.mustGet(userClient.wallet.publicKey.toBase58());
assert(escrow.orders.length === 2);

// Resize to handle 10 orders
await userClient.resizeRevenueShareEscrowOrders(
    userClient.wallet.publicKey,
    10
);

// Verify new size
escrow = await escrowMap.mustGet(userClient.wallet.publicKey.toBase58());
assert(escrow.orders.length === 10);
```