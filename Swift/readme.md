# Swift
Swift is an extension to Drift which enables users to place orders without needing to submit a transaction to the Solana network. 
Instead of having users submit transactions to the Solana network, users sign a message containing their order parameters and submit it to keepers and market makers offchain. Keepers and market makers then bundle the message with their transaction to fill user orders.

Orders have to be submitted to the Swift API: [https://swift.drift.trade]

## Order setup
Similar to normal orders, order parameters need to be defined. Order parameters <a href="https://drift-labs.github.io/v2-teacher/#order-params">overview</a>

To pass an order to Swift, the following steps are required:
1. Define order parameters
2. Generate and Sign order
3. Submit to Swift API

## Order example(market taker)
```typescript
const marketIndex = 0; // 0 = SOL-PERP market

const oracleInfo = driftClient.getOracleDataForPerpMarket(marketIndex);
const highPrice = oracleInfo.price.muln(101).divn(100);
const lowPrice = oracleInfo.price;

const orderParams = getMarketOrderParams({
    marketIndex: marketIndex,
    marketType: MarketType.PERP,
    direction: PositionDirection.LONG,
    baseAssetAmount: driftClient.convertToPerpPrecision(0.1), // 0.1 SOL,
    auctionStartPrice: isVariant(direction, 'long') ? lowPrice : highPrice,
		auctionEndPrice: isVariant(direction, 'long') ? highPrice : lowPrice,
		auctionDuration: 50,
});
```

For choosing what values to pass in, there are a few ways;

This swift market order example in the uses a 1% offset from the oracle to construct the high price. The potential problem with using the oracle for price input is that it might not reflect the orderbook spread. Another approach would be:

Getting the bid/ask spread from the DLOB server <a href="https://drift-labs.github.io/v2-teacher/?typescript#orderbook-trades-dlob-server">docs</a>.

Recommended to use the /l2 endpoint for aggregate price levels. Example for SOL-PERP:
https://dlob.drift.trade/l2?marketName=SOL-PERP

## Sign order
```typescript
const slot = await driftClient.connection.getSlot();

const orderMessage = {
    signedMsgOrderParams: orderParams,
    subAccountId: driftClient.activeSubAccountId,
    slot: new BN(slot),
    uuid: generateSignedMsgUuid(),
    stopLossOrderParams: null,
    takeProfitOrderParams: null,
};

// Sign the message
const signedOrder = driftClient.signSignedMsgOrderParamsMessage(orderMessage);
const message = Buffer.from(signedOrder.orderParams).toString('hex');
const signature = Buffer.from(signedOrder.signature).toString('base64');
```

## Submit order to Swift API
```typescript
const swiftUrl = 'https://swift.drift.trade/orders';

const response = await axios.default.post(swiftUrl, {
    market_index: marketIndex,
    market_type: 'perp',
    message: message,
    signature: signature,
    taker_pubkey: driftClient.wallet.publicKey.toBase58(),
}, {
    headers: { 'Content-Type': 'application/json' }
});

console.log("Order response:", response.data);
```
