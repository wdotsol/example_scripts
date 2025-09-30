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

