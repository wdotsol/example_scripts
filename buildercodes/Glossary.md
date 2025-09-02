# Glossary

## Core Types and Identifiers

### RevenueShareAccount
**Definition**: Builder's account that accumulates and stores earned fees.

**Location**: `protocol-v2-merge-builder/programs/drift/src/state/revenue_share.rs:1`

**Key Fields**:
- `authority`: Builder's public key
- `total_builder_rewards`: Total fees earned from builder codes
- `total_referrer_rewards`: Total fees earned from referrals

### RevenueShareEscrow
**Definition**: User's escrow account that tracks builder fees per order.

**Location**: `protocol-v2-merge-builder/programs/drift/src/state/revenue_share.rs:170`

**Key Fields**:
- `authority`: User's public key
- `orders`: Array of `RevenueShareOrder` tracking individual orders
- `approved_builders`: Array of `BuilderInfo` with user-approved builders

### BuilderInfo
**Definition**: User-approved builder with fee limits and authority.

**Location**: `protocol-v2-merge-builder/programs/drift/src/state/revenue_share.rs:150`

**Key Fields**:
- `authority`: Builder's public key
- `max_fee_tenth_bps`: Maximum fee allowed in tenth basis points (0.01% increments)

### RevenueShareOrder
**Definition**: Individual order tracking with fee accrual and completion status.

**Location**: `protocol-v2-merge-builder/programs/drift/src/state/revenue_share.rs:100`

**Key Fields**:
- `builder_idx`: Index into user's approved builders list
- `fees_accrued`: Accumulated fees for this order
- `is_completed`: Whether order has been filled
- `market_index`: Market where order was placed

## SDK Functions

### initializeRevenueShare
**Definition**: Initialize builder's revenue share account to receive fees.

**Location**: `protocol-v2-merge-builder/sdk/src/driftClient.ts:1256`

**Usage**: `await builderClient.initializeRevenueShare(builderAuthority)`

### initializeRevenueShareEscrow
**Definition**: Initialize user's escrow account for tracking builder fees.

**Location**: `protocol-v2-merge-builder/sdk/src/driftClient.ts:1284`

**Usage**: `await userClient.initializeRevenueShareEscrow(userAuthority, numOrders)`

### changeApprovedBuilder
**Definition**: Add, update, or remove approved builder from user's escrow.

**Location**: `protocol-v2-merge-builder/sdk/src/driftClient.ts:1385`

**Usage**: `await userClient.changeApprovedBuilder(userAuthority, builderPubkey, maxFeeBps, add)`

### placeSignedMsgTakerOrder
**Definition**: Place order with signed message including builder code parameters.

**Location**: `protocol-v2-merge-builder/sdk/src/driftClient.ts:6739`

**Usage**: `await client.placeSignedMsgTakerOrder(signedOrder, marketIndex, takerInfo)`

## Error Codes

### BuilderRevoked
**Definition**: Builder has been revoked by user (max fee set to 0).

**Location**: `protocol-v2-merge-builder/programs/drift/src/error.rs:643`

**Cause**: User removed builder from approved list.

### InvalidBuilderFee
**Definition**: Order fee exceeds user-approved maximum.

**Location**: `protocol-v2-merge-builder/programs/drift/src/error.rs:645`

**Cause**: `builderFeeTenthBps > maxFeeTenthBps`.

### CannotRevokeBuilderWithOpenOrders
**Definition**: Cannot remove builder while they have open orders.

**Location**: `protocol-v2-merge-builder/programs/drift/src/error.rs:653`

**Cause**: User has active orders with the builder.

## Helper Functions

### buildMsg
**Definition**: Helper function to create `SignedMsgOrderParamsMessage` with builder code.

**Location**: `protocol-v2-merge-builder/tests/builderCodes.ts:74`

**Usage**: `buildMsg(marketIndex, baseAssetAmount, userOrderId, feeBps, slot)`

### hasBuilder
**Definition**: Check if order has builder code attached.

**Location**: `protocol-v2-merge-builder/sdk/src/index.ts` (exported)

**Usage**: `if (hasBuilder(order)) { /* handle builder order */ }`

### RevenueShareEscrowMap
**Definition**: Map for managing and syncing escrow accounts.

**Location**: `protocol-v2-merge-builder/sdk/src/userMap/revenueShareEscrowMap.ts:6`

**Usage**: `const escrowMap = new RevenueShareEscrowMap(driftClient, false)`

## Constants and Precision

### BASE_PRECISION
**Definition**: Precision for base asset amounts (e.g., SOL).

**Location**: `protocol-v2-merge-builder/sdk/src/constants.ts`

**Value**: `1e9` (9 decimal places)

### PRICE_PRECISION
**Definition**: Precision for price values.

**Location**: `protocol-v2-merge-builder/sdk/src/constants.ts`

**Value**: `1e6` (6 decimal places)

### QUOTE_PRECISION
**Definition**: Precision for quote asset amounts (e.g., USDC).

**Location**: `protocol-v2-merge-builder/sdk/src/constants.ts`

**Value**: `1e6` (6 decimal places)

## Fee Calculation

### builderFeeTenthBps
**Definition**: Builder fee in tenth basis points (0.01% increments).

**Formula**: `fee = quoteAmount * builderFeeTenthBps / 100000`

**Example**: `70` = 0.7% fee

### maxFeeTenthBps
**Definition**: User-approved maximum fee for a builder.

**Validation**: `builderFeeTenthBps <= maxFeeTenthBps`

**Example**: `150` = 1.5% maximum fee
