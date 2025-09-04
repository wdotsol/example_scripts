# Reading Data

## Positions

### Perp Positions

```typescript
import { getOpenPositionData } from 'drift-common';

const positions = getOpenPositionData(
  driftClient,
  user.getPerpPositions(), 
  user,
  Config.perpMarketsLookup,
  (marketIndex) => markPriceCache.getMarkPrice(marketIndex) // optional
);

console.log(positions[0]);
// {
//   marketIndex: 0,
//   marketSymbol: 'SOL-PERP', 
//   direction: 'long',
//   notional: BN,           // position size in USD
//   baseSize: BN,           // position size in base asset 
//   entryPrice: BN,         // average entry price
//   pnlVsOracle: BN,        // PnL vs oracle price
//   pnlVsMark: BN,          // PnL vs mark price
//   unsettledPnl: BN,       // claimable PnL
//   liqPrice: BN,           // liquidation price
//   ...
// }
```

### Position Details

```typescript
import { getPriceBasedPositionInfo } from 'drift-common';

const positionInfo = getPriceBasedPositionInfo(
  driftClient,
  user,
  position,
  perpMarketConfig,
  referencePrice // mark or oracle price
);

console.log(positionInfo);
// {
//   positionNotionalPnl: BigNum,    // PnL in USD terms
//   positionPnlPercentage: 12.5     // PnL as percentage
// }
```

## Balances & Margin

### Spot Balances

```typescript
import { getSpotBalanceInfo } from 'drift-common';

const balanceInfo = getSpotBalanceInfo(
  driftClient,
  user,
  marketIndex,
  oraclePrice
);

console.log(balanceInfo);
// {
//   marketIndex: 1,
//   baseBalance: BigNum,        // net balance (deposits - borrows)
//   notionalBalance: BigNum,    // USD value
//   liquidationPrice: BigNum    // liquidation price for this market
// }
```

### Account Health

```typescript
import { getAccountMarginInfo } from 'drift-common';

const marginInfo = getAccountMarginInfo(
  driftClient,
  user,
  (marketKey) => oraclePriceCache.getOraclePrice(marketKey)
);

console.log(marginInfo);
// {
//   netUsdValue: BigNum,              // total account value
//   totalUnsettledPnl: BigNum,        // unsettled PnL from perps
//   totalClaimablePnl: BigNum,        // claimable PnL
//   freeInitialMargin: BigNum,        // available for new positions
//   freeMaintenanceMargin: BigNum,    // buffer before liquidation
//   leverage: 2.5,                    // current leverage
//   marginRatioPct: 150               // margin ratio percentage
// }
```

## Market Data

### Funding Rates

```typescript
import { getMarketPredictedFunding, getMarketHistoricalFunding } from 'drift-common';

// Current predicted funding
const funding = getMarketPredictedFunding(driftClient, marketIndex);
console.log(funding);
// { longFundingRate: 0.0001, shortFundingRate: -0.0001 }

// Historical funding from API
const history = await getMarketHistoricalFunding('SOL-PERP');
console.log(history[0]);
// { slot: 123456, fundingRatePct: 0.012 }
```

### Market Metadata

```typescript
import { MARKET_UTILS } from 'drift-common';

const config = MARKET_UTILS.getMarketConfig(driftEnv, MarketType.PERP, 0);
const symbol = MARKET_UTILS.getBaseAssetSymbol('SOL-PERP');
const paused = MARKET_UTILS.getPausedOperations(perpMarketAccount);

console.log({ config, symbol, paused });
// { 
//   config: { marketIndex: 0, symbol: 'SOL-PERP', ... },
//   symbol: 'SOL',
//   paused: ['Funding'] // if any operations are paused
// }
```

## Order Details

### Order Serialization

```typescript
import { getOrderDetails } from 'drift-common';

const uiOrder = getOrderDetails(order);
console.log(uiOrder);
// Returns UISerializableOrder with BigNum types and formatted fields
```

### Account Validation

```typescript
import { checkIfUserAccountExists } from 'drift-common';

const exists = await checkIfUserAccountExists(
  driftClient,
  { authority: wallet.publicKey, subAccountId: 0 }
);
console.log(exists); // true if drift account exists
```

## Price Calculation

### Mark Price from Order Book

```typescript
import { calculateBidAskAndmarkPrice, calculateSpreadBidAskMark } from 'drift-common';

const { bestBidPrice, bestAskPrice, markPrice } = calculateBidAskAndmarkPrice(
  l2OrderBook,
  oraclePrice // optional fallback
);

// Or get everything including spread
const { 
  bestBidPrice, 
  bestAskPrice, 
  markPrice, 
  spreadQuote, 
  spreadPct 
} = calculateSpreadBidAskMark(l2OrderBook, oraclePrice);

console.log({ markPrice, spreadPct });
// { markPrice: BN, spreadPct: BN }
```

## Trading Analysis

### Profit Estimation

```typescript
import { calculatePotentialProfit } from 'drift-common';

const profitAnalysis = calculatePotentialProfit({
  currentPositionSize: BigNum.from(new BN('1000000'), 9),
  currentPositionDirection: PositionDirection.LONG,
  currentPositionEntryPrice: BigNum.from(new BN('50000000'), 6),
  tradeDirection: PositionDirection.SHORT,
  exitBaseSize: BigNum.from(new BN('500000'), 9),
  exitPrice: BigNum.from(new BN('55000000'), 6),
  takerFeeBps: 5,
});

console.log(profitAnalysis);
// {
//   estimatedProfit: BigNum,
//   estimatedProfitBeforeFees: BigNum,
//   estimatedTakerFee: BigNum,
//   notionalSizeAtEntry: BigNum,
//   notionalSizeAtExit: BigNum
// }
```

### Liquidation Price Calculation

```typescript
import { calculateLiquidationPriceAfterPerpTrade } from 'drift-common';

const liqPrice = calculateLiquidationPriceAfterPerpTrade({
  user,
  marketIndex: 0,
  ammAccountState: perpMarketAccount.amm,
  oraclePrice: new BN('50000000'),
  positionSizeDelta: new BN('1000000'),
  marginCategory: 'Initial',
});

console.log(liqPrice);
// BN representing liquidation price after trade
```

### Market Precision

```typescript
import { getMarketTickSize, getMarketStepSize } from 'drift-common';

const tickSize = getMarketTickSize(perpMarketAccount);
const stepSize = getMarketStepSize(perpMarketAccount);

console.log({ tickSize, stepSize });
// { tickSize: BN, stepSize: BN }
// tickSize: minimum price increment
// stepSize: minimum order size increment
```

## Trade Records

### Trade Information Extraction

```typescript
import { getTradeInfoFromActionRecord } from 'drift-common';

const tradeInfo = getTradeInfoFromActionRecord(actionRecord);
console.log(tradeInfo);
// {
//   ts: timestamp,
//   baseAssetAmount: amount,
//   baseAssetAmountFilled: filled,
//   quoteAssetAmountFilled: quote_filled
// }
```

### Trade Filtering

```typescript
import { filterTradeRecordsFromUIOrderRecords } from 'drift-common';

const trades = filterTradeRecordsFromUIOrderRecords(allOrderRecords);
// Returns only records that represent actual trades (fills with size > 0)
```

## Market Analytics

### Open Interest

```typescript
import { getCurrentOpenInterestForMarket } from 'drift-common';

const openInterest = getCurrentOpenInterestForMarket(
  marketIndex,
  MarketType.PERP,
  driftClient
);
console.log(openInterest); // Quote amount of total open interest
```

### Market Rates

```typescript
import { getDepositAprForMarket, getBorrowAprForMarket } from 'drift-common';

const depositApr = getDepositAprForMarket(marketIndex, MarketType.SPOT, driftClient);
const borrowApr = getBorrowAprForMarket(marketIndex, MarketType.SPOT, driftClient);

console.log({ depositApr, borrowApr });
// { depositApr: 5.2, borrowApr: 8.7 } // percentages
```

### Market Totals

```typescript
import { getTotalBorrowsForMarket, getTotalDepositsForMarket } from 'drift-common';

const totalBorrows = getTotalBorrowsForMarket(marketConfig, driftClient);
const totalDeposits = getTotalDepositsForMarket(marketConfig, driftClient);

console.log({ totalBorrows, totalDeposits });
// {
//   totalBorrows: 1234567.89, // USD value
//   totalDeposits: { totalDepositsBase: 1000.5, totalDepositsQuote: 50000.25 }
// }
```

## Vault Data

### Insurance Fund Information

```typescript
import { getIfVaultBalance, getIfStakingVaultApr } from 'drift-common';

const vaultBalance = await getIfVaultBalance(driftClient, vaultAccountPubkey);
const stakingApr = await getIfStakingVaultApr(
  driftClient,
  vaultAccountPubkey,
  ifStakeAccountPubkey
);

console.log({ vaultBalance, stakingApr });
// { vaultBalance: BigNum, stakingApr: 12.5 }
```
