# Patterns

## Position Formatting

### Map positions to table rows
```typescript
import { getOpenPositionData, NumLib } from 'drift-common';

const formatPositionRow = (position: OpenPosition) => ({
  market: position.marketSymbol,
  side: position.direction,
  size: NumLib.formatNum.toTradePrecisionString(position.baseSize.toNum()),
  notional: NumLib.formatNum.toNotionalDisplay(position.notional.toNum()),
  pnl: NumLib.formatNum.toColoredPnlDisplay(position.pnlVsMark.toNum()),
  entryPrice: NumLib.formatNum.toPriceDisplay(position.entryPrice.toNum()),
});

const tableData = positions.map(formatPositionRow);
```

### Position PnL percentage
```typescript
import { calculatePnlPctFromPosition } from 'drift-common';

const pnlPercent = calculatePnlPctFromPosition(
  position.pnlVsMark,
  position.quoteEntryAmount,
  userLeverage
);
// Returns: 12.5 (for 12.5% PnL)
```

## Market Metadata

### Symbol parsing and display
```typescript
import { MARKET_UTILS } from 'drift-common';

const symbol = MARKET_UTILS.getBaseAssetSymbol('SOL-PERP'); // 'SOL'
const clean = MARKET_UTILS.getBaseAssetSymbol('1KWEN-PERP', true); // 'WEN' (removes prefix)
```

### Market status checking
```typescript
const pausedOps = MARKET_UTILS.getPausedOperations(perpMarketAccount);
const isTradesPaused = pausedOps.includes('Fills');
const isFundingPaused = pausedOps.includes('Funding');
```

## Number Formatting

### Trade precision (6 significant digits)
```typescript
import { NumLib } from 'drift-common';

const formattedSize = NumLib.formatNum.toTradePrecisionString(1.234567); // '1.23457'
const formattedPrice = NumLib.formatNum.toPriceDisplay(50.123456); // '$50.12'
```

### Notional display with currency
```typescript
const notional = NumLib.formatNum.toNotionalDisplay(1234.56); // '$1,234.56'
const pnl = NumLib.formatNum.toColoredPnlDisplay(-123.45); // '-$123.45' (styled red)
```

## Order Handling

### Order label generation
```typescript
import { getOrderLabelFromOrderDetails } from 'drift-common';

const label = getOrderLabelFromOrderDetails({
  orderType: OrderType.LIMIT,
  oraclePriceOffset: new BN(1000), // non-zero offset
  direction: PositionDirection.LONG,
  triggerCondition: OrderTriggerCondition.ABOVE,
  existingPositionDirection: PositionDirection.SHORT,
});
// Returns: 'Oracle Limit'
```

### Auction params handling
```typescript
const auctionParams = order.auctionStartPrice.eq(ZERO) 
  ? EMPTY_AUCTION_PARAMS 
  : {
      auctionStartPrice: order.auctionStartPrice,
      auctionEndPrice: order.auctionEndPrice,
      auctionDuration: order.auctionDuration,
    };
```

## Safe Data Access

### Missing market handling
```typescript
const getMarketOrFallback = (marketIndex: number) => {
  const market = Config.perpMarketsLookup[marketIndex];
  if (!market) {
    console.warn(`Market ${marketIndex} not found, using fallback`);
    return { symbol: 'UNKNOWN', marketIndex };
  }
  return market;
};
```

### Equality checking with BigNum
```typescript
import { arePropertiesEqual } from 'drift-common';

const positionsEqual = arePropertiesEqual(pos1, pos2, [
  ['marketIndex', 'primitive'],
  ['baseAssetAmount', 'bn'],
  ['direction', 'programEnum'],
]);
```

## Math Utilities

### Mark price calculation from orderbook
```typescript
import { calculateBidAskAndmarkPrice } from 'drift-common';

const { bestBidPrice, bestAskPrice, markPrice } = calculateBidAskAndmarkPrice(
  l2OrderBook,
  oraclePrice // optional fallback
);
```

### Spread calculation
```typescript
const { spreadPct, spreadQuote } = calculateSpread(
  bestBidPrice,
  bestAskPrice, 
  markPrice
);
// spreadPct: percentage as BN, spreadQuote: absolute difference
```

## Additional Formatting

### Price Display

```typescript
import { NumLib } from 'drift-common';

const priceFormatted = NumLib.formatNum.toPriceDisplay(50.123456);
console.log(priceFormatted); // '$50.12'
```

### PnL Display with Colors

```typescript
const pnlDisplay = NumLib.formatNum.toColoredPnlDisplay(-123.45);
console.log(pnlDisplay); // '-$123.45' (styled red for negative)
```

### Basis Points

```typescript
const bpsDisplay = NumLib.formatNum.toBps(0.005);
console.log(bpsDisplay); // '50bps' (0.5% as basis points)
```

## Record Sorting

### Order Record Sorting

```typescript
import { getSortScoreForOrderRecords, sortUIOrderRecords } from 'drift-common';

// Manual sorting comparison
const score = getSortScoreForOrderRecords(orderA, orderB);
// Returns 1 if orderA is later, -1 if earlier, 0 if equal

// Batch sorting
const sortedRecords = sortUIOrderRecords(orderRecords, 'desc');
// Returns records sorted by slot and chronological order
```

## Order Validation

### Full Position Check

```typescript
import { isEntirePositionOrder } from 'drift-common';

const isFullClose = isEntirePositionOrder(orderAmount);
console.log(isFullClose); // true if order closes entire position
```

## Data Serialization

### Object Encoding for Storage

```typescript
import { encodeStringifiableObject, decodeStringifiableObject } from 'drift-common';

// Encode BN and PublicKey for JSON storage
const encoded = encodeStringifiableObject({
  amount: new BN('1000000'),
  authority: new PublicKey('...'),
  price: 50.25
});
// Returns: { '_bgnm_amount': '1000000', '_pbky_authority': '...', price: 50.25 }

// Decode back to original types
const decoded = decodeStringifiableObject(encoded);
// Returns: { amount: BN, authority: PublicKey, price: 50.25 }
```
