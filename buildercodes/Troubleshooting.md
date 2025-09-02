# Troubleshooting

## Common Issues and Solutions

### Builder Codes Not Enabled yet

**Problem**: Builder codes functionality is disabled by admin.

**Solution**: Enable the feature flag (admin only).

```typescript
// Check if builder codes are enabled
const state = await driftClient.getStateAccount();
const builderCodesEnabled = state.builderCodesEnabled();

if (!builderCodesEnabled) {
    console.log('Builder codes feature is disabled');
    // Contact admin to enable
}
```

**Test Reference**: `tests/builderCodes.ts:182` - `updateFeatureBitFlagsBuilderCodes(true)`

### Missing RevenueShareEscrow Account

**Problem**: User tries to place order with builder code but no escrow exists.

**Solution**: Initialize escrow account first.

```typescript
// Initialize escrow before placing builder orders
await userClient.initializeRevenueShareEscrow(
    userClient.wallet.publicKey,
    5  // Space for 5 orders
);
```

**Test Reference**: `tests/builderCodes.ts:370` - `initializeRevenueShareEscrow`

### Builder Not Approved

**Problem**: Order rejected because builder is not in user's approved list.

**Solution**: Add builder to approved list with fee limit.

```typescript
// Approve builder with max fee
await userClient.changeApprovedBuilder(
    userClient.wallet.publicKey,
    builder.publicKey,
    150,  // 1.5% max fee
    true  // Add/update
);
```

**Test Reference**: `tests/builderCodes.ts:458` - `changeApprovedBuilder`

### Fee Exceeds User-Approved Limit

**Problem**: Order rejected with `InvalidBuilderFee` error.

**Solution**: Check fee against user's approved limit.

```typescript
// Get user's approved builder info
const escrow = await escrowMap.mustGet(userClient.wallet.publicKey.toBase58());
const builder = escrow.approvedBuilders.find(b => b.authority.equals(builderPubkey));

if (builder && requestedFee > builder.maxFeeTenthBps) {
    console.log(`Fee ${requestedFee} exceeds max ${builder.maxFeeTenthBps}`);
}
```

**Test Reference**: `tests/builderCodes.ts:750` - `InvalidBuilderFee` error handling

### Cannot Revoke Builder with Open Orders

**Problem**: Attempt to remove builder fails with open orders.

**Solution**: Cancel all orders first, then remove builder.

```typescript
// Cancel all open orders
await userClient.cancelOrders();

// Now remove builder
await userClient.changeApprovedBuilder(
    userClient.wallet.publicKey,
    builder.publicKey,
    0,
    false  // Remove
);
```

**Test Reference**: `tests/builderCodes.ts:775` - Error handling for revocation

### Escrow Account Too Small

**Problem**: Escrow runs out of space for new orders.

**Solution**: Resize escrow account.

```typescript
// Resize to handle more orders
await userClient.resizeRevenueShareEscrowOrders(
    userClient.wallet.publicKey,
    20  // Increase to 20 orders
);
```

**Test Reference**: `tests/builderCodes.ts:400` - `resizeRevenueShareEscrowOrders`

### Missing Escrow in Settlement

**Problem**: `settle_pnl` fails because escrow account not included.

**Solution**: Always include escrow map in settlement calls.

```typescript
// Include escrow map for fee processing
const settleTx = await client.settlePNL(
    userPubkey,
    userAccount,
    marketIndex,
    undefined,
    undefined,
    escrowMap  // Required!
);
```

**Test Reference**: `tests/builderCodes.ts:929` - `settlePNL` with escrow map

### Builder Fees Not Accruing

**Problem**: Orders placed but no fees accumulating in escrow.

**Solution**: Verify order parameters and escrow setup.

```typescript
// Check order has builder code
const order = user.getOpenOrders().find(o => o.orderId === orderId);
if (!hasBuilder(order)) {
    console.log('Order missing builder code');
}

// Check escrow has space
const escrow = await escrowMap.mustGet(user.publicKey.toBase58());
if (escrow.orders.length === 0) {
    console.log('Escrow not initialized');
}
```

**Test Reference**: `tests/builderCodes.ts:700` - Order placement verification

### RevenueShareAccount Not Found

**Problem**: Builder can't receive fees because account not initialized.

**Solution**: Initialize builder's revenue share account.

```typescript
// Builder must initialize account to receive fees
await builderClient.initializeRevenueShare(builderClient.wallet.publicKey);
```

**Test Reference**: `tests/builderCodes.ts:334` - `initializeRevenueShare`

## Error Code Reference

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `BuilderRevoked` | Builder was removed by user | Re-approve builder or use different one |
| `InvalidBuilderFee` | Fee exceeds user-approved limit | Reduce fee or increase user limit |
| `CannotRevokeBuilderWithOpenOrders` | Can't remove builder with active orders | Cancel orders first |
| `RevenueShareEscrowMissing` | User escrow account not found | Initialize escrow account |
| `InvalidRevenueShareAccount` | Builder account not initialized | Initialize builder account |