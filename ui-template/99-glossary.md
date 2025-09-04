# Glossary

## Core Types

### `OpenPosition`
UI-ready position data with PnL calculations and liquidation prices.  

### `SpotBalanceInfo`
Essential balance metrics: net balance, notional value, liquidation price.  

### `AccountMarginInfo`
Complete account health: margins, leverage, PnL, collateral details.  

### `PriceBasedPositionInfo`
Position PnL analysis at a specific reference price.  

### `UIOrderType`
UI-friendly order type enumeration: `'market' | 'limit' | 'stopMarket' | 'oracle'`.  

### `MarketSymbol`
Opaque string type uniquely identifying a market (e.g., `'SOL-PERP'`).  

## Key Functions

### `getOpenPositionData()`
Transforms raw perp positions into UI-ready format with PnL calculations.  

### `getSpotBalanceInfo()`
Extracts essential balance information for a specific spot market.  

### `getAccountMarginInfo()`
Calculates comprehensive account health and margin metrics.  

### `openPerpOrderTxn()`
Creates perp order transactions with Swift or on-chain routing.  

### `createCancelOrdersTxn()`
Builds transaction to cancel multiple orders by ID.  

### `prepSwiftOrder()`
Prepares off-chain order message for Swift server routing.  

### `calculatePotentialProfit()`
Estimates profit/loss for closing positions with fee calculations.  

### `calculateBidAskAndmarkPrice()`
Derives mark price from L2 order book with oracle fallback.  

### `getCurrentOpenInterestForMarket()`
Calculates total open interest in quote terms for a perp market.  

### `getDepositAprForMarket()`
Returns deposit APR percentage for a spot market.  

### `getOrderDetails()`
Converts raw Order to UI-serializable format with BigNum types.  

### `CentralServerDrift`
Server-side client for creating transactions for any user without wallets.  

## Utility Modules

### `COMMON_UTILS`
Market analysis helpers: APR calculations, open interest, funding rates.  

### `TRADING_UTILS`
Position calculations: PnL percentages, profit estimation, order validation.  

### `MARKET_UTILS`
Market metadata parsing: symbol extraction, pause status, config lookup.  

### `NumLib`
Number formatting utilities for UI display: precision, currency, colors.  

### `ENUM_UTILS`
Safe enum comparison utilities avoiding strict equality issues.  

## Configuration

### `Config`
Global configuration state containing market lookups and initialization status.  

### `Initialize()`
Initializes SDK and populates market configuration lookups.  

### `EnvironmentConstants`
Pre-configured RPC endpoints and server URLs for each environment.  

## Constants

### Precision Constants
- `BASE_PRECISION_EXP = 9` - Base asset precision (9 decimals)
- `PRICE_PRECISION_EXP = 6` - Price precision (6 decimals)  
- `QUOTE_PRECISION_EXP = 6` - Quote asset precision (6 decimals)

### Market Indices
- `USDC_SPOT_MARKET_INDEX = 0` - USDC spot market
- `QUOTE_SPOT_MARKET_INDEX = 0` - Quote asset market

### Pool IDs
- `MAIN_POOL_ID = 0` - Main pool identifier
- `JLP_POOL_ID = 1` - JLP pool identifier  
- `LST_POOL_ID = 2` - LST pool identifier

## Helper Types

### `MarketId`
Utility for creating type-safe market identifiers with helper methods.  

### `AuctionParams`
Order auction configuration: start/end prices, duration, slippage constraints.  

### `EditOrderParams`
Parameters for modifying existing orders: price, size, conditions.  
