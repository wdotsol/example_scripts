# Troubleshooting

## Setup Errors

### Config not initialized
```
Error: Config not initialized. Call Initialize(env) first.
```
**Fix:** Call `Initialize()` before using any helpers:
```typescript
import { Initialize } from 'drift-common';
Initialize('mainnet-beta'); // or 'devnet'
```

### Missing market config
```
TypeError: Cannot read properties of undefined (reading 'symbol')
```
**Fix:** Check market exists before accessing:
```typescript
const market = Config.perpMarketsLookup[marketIndex];
if (!market) {
  console.warn(`Market ${marketIndex} not found`);
  return;
}
```

## Type Errors

### BigNum vs BN confusion
```
TypeError: baseAssetAmount.toNum is not a function
```
**Fix:** Use correct method for each type:
```typescript
// BN (from @drift-labs/sdk)
const bn = new BN('1000000');
bn.toString(); // 
bn.toNumber(); // (if small enough)

// BigNum (drift-common)
const bigNum = BigNum.from(bn, 6);
bigNum.toNum(); // 
bigNum.print(); // 
```

### Enum comparison errors
```
TypeError: Cannot read properties of undefined (reading 'long')
```
**Fix:** Use `ENUM_UTILS.match()` for enum comparisons:
```typescript  
import { ENUM_UTILS } from 'drift-common';
if (ENUM_UTILS.match(position.direction, PositionDirection.LONG))
```

### Missing user account
```
Error: User account not found
```
**Fix:** Initialize user properly:
```typescript
const user = new User({
  driftClient,
  userAccountPublicKey: wallet.publicKey,
});
await user.subscribe();
```

## Runtime Errors

### Oracle price undefined
```
TypeError: Cannot read properties of undefined (reading 'price')
```
**Fix:** Check oracle data validity:
```typescript
const oracleData = driftClient.getOracleDataForPerpMarket(marketIndex);
if (!oracleData || !oracleData.price) {
  console.warn('Oracle data unavailable');
  return;
}
```

### Insufficient precision
```
RangeError: Maximum call stack size exceeded
```
**Fix:** Use appropriate precision for calculations:
```typescript
const result = BigNum.from(amount, PRICE_PRECISION_EXP); // 6
```

### Market order book empty
```
TypeError: Cannot read properties of undefined (reading 'length')
```
**Fix:** Handle empty order books:
```typescript
const { markPrice } = calculateSpreadBidAskMark(l2OrderBook);
if (!markPrice) {
  // Fall back to oracle price
  const oraclePrice = driftClient.getOraclePrice(marketIndex);
  return oraclePrice;
}
```

## Connection Issues

### RPC timeout
```
Error: 504 Gateway Timeout
```
**Fix:** Use multiple RPC endpoints:
```typescript
import { EnvironmentConstants } from 'drift-common';

const tryConnection = async () => {
  const endpoints = EnvironmentConstants.rpcs.mainnet;
  for (const endpoint of endpoints) {
    try {
      return new Connection(endpoint.value);
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint.label}`);
    }
  }
  throw new Error('All RPC endpoints failed');
};
```

### Subscription failures  
```
Error: WebSocket connection failed
```
**Fix:** Implement retry logic:
```typescript
const subscribeWithRetry = async (client, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await client.subscribe();
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * i));
    }
  }
};
```
