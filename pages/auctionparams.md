## Overview

The `/auctionParams` endpoint is designed to provide SDK users with recommended auction parameters for market orders, similar to the logic used in the Drift UI.

### Endpoint

```
GET /auctionParams
```

### Query Parameters

| Name              | Type    | Required | Description                                                                                     |
| ----------------- | ------- | -------- | ----------------------------------------------------------------------------------------------- |
| `marketIndex`     | int     | Yes      | Index of the market to trade.                                                                   |
| `marketType`      | string  | Yes      | Market type                                                              |
| `direction`       | string  | Yes      | Order direction: `long` or `short`.                                                             |
| `amount`          | number  | Yes      | The order size. Interpreted as to `assetType` field
| `assetType`       | string  | Yes      | One of: `base`, `quote`. Specifies the asset the `amount` refers to.                            |
| `auctionDuration` | int     | Optional | (Default: UI default) Duration of the auction    |
| `reduceOnly`      | boolean | Optional | (Default: false) If true, order will only reduce existing position.                             |

### Sample Request

```http
GET /auctionParams?marketIndex=0&marketType=perp&direction=long&amount=100&assetType=base&auctionDuration=45&reduceOnly=true
```

### Sample Response

```json
{
  "data": {
    "params": {
      "orderType": "oracle",
      "marketType": "perp",
      "userOrderId": 0,
      "direction": "long",
      "baseAssetAmount": "100000000000",
      "marketIndex": 0,
      "reduceOnly": true,
      "postOnly": "none",
      "bitFlags": 0,
      "triggerPrice": null,
      "triggerCondition": "above",
      "oraclePriceOffset": 4807,
      "auctionDuration": 45,
      "maxTs": null,
      "auctionStartPrice": "-70609",
      "auctionEndPrice": "4807"
    },
    "entryPrice": "150936230",
    "bestPrice": "150889000",
    "worstPrice": "150941900",
    "priceImpact": 0.000313,
    "slippageTolerance": 0.05
  }
}
```

### Response Fields

| Field                      | Type         | Description                                                  |
| -------------------------- | ------------ | ------------------------------------------------------------ |
| `params.orderType`         | string       | Type of order                       |
| `params.marketType`        | string       | Market type: `perp` or `spot`.                               |
| `params.userOrderId`       | int          | Unique user defined order ID (default `0` if not specified). |
| `params.direction`         | string       | Order direction: `long` or `short`.                          |
| `params.baseAssetAmount`   | string       | Size of the order       |
| `params.marketIndex`       | int          | The index of the selected market.                            |
| `params.reduceOnly`        | boolean      | If true, order will only reduce existing position.           |
| `params.postOnly`          | string       | Post-only mode                   |
| `params.bitFlags`          | int          | Advanced options (bit flags).                                |
| `params.triggerPrice`      | number\|null | Trigger price for conditional orders.                        |
| `params.triggerCondition`  | string       | Condition for the trigger, e.g., `above`, `below`.           |
| `params.oraclePriceOffset` | number       | Auction offset from oracle price.                            |
| `params.auctionDuration`   | int          | How long the auction will run.                               |
| `params.maxTs`             | int\|null    | (Optional) Maximum timestamp to execute.                     |
| `params.auctionStartPrice` | string       | Price at auction start.                                      |
| `params.auctionEndPrice`   | string       | Price at auction end.                                        |
| `entryPrice`               | string       | The expected fill price for the order       |
| `bestPrice`                | string       | Best case fill price                          |
| `worstPrice`               | string       | Worst case fill price                         |
| `priceImpact`              | number       | Estimated market impact from the order.                      |
| `slippageTolerance`        | number       | The slippage parameter used for auction calculation.         |
