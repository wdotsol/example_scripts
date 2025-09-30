

## Builder initialization

```ts
await builderDriftClient.initializeRevenueShare(builderAuthority)
```

Builders must initialize a `RevenueShare` account before they are able to accrue builder fees.

## User initialization

### BuilderShareEscrow Account

```ts
await takerClient.initializeRevenueShareEscrow(takerAuthority, numOrders)
```

Each taker/user must initialize a `BuilderShareEscrow` account before they are able to start paying builder fees. In practice this is an on boarding step provided by the builder. 

`numOrders` should be large enough to hold all open orders that the taker will have at any point.

### Builder approval

```ts
// 200 = 20 bps max fee
await takerClient.changeApprovedBuilder(builderAuthority, 200, true)
```

Each taker must approve every builder with their max payable fee before builder fees can be charged. The max fee is expressed in tenth of a basis point (100 = 10 bps).

## Order placement

Buildercodes function through Swift, this is achieved by setting the builderIdx and builderFee in the signed message sent to the swift server.

```typescript
const orderMessage: SignedMsgOrderParamsMessage = {
        signedMsgOrderParams: marketOrderParams as OrderParams,
        subAccountId: takerClient.activeSubAccountId,
        slot: new BN(slot + 100),
        uuid: generateSignedMsgUuid(),
        stopLossOrderParams: null,
        takeProfitOrderParams: null,

        /// The builder's UI must include these 2 fields
        /// in order to append a builder fee.
        builderIdx: 0,          // the builder is idx 0 on the taker's RevenueShareEscrow.approved_builders list
        builderFeeTenthBps: 50, // builder fee on this order: 5 bps
    };
```
