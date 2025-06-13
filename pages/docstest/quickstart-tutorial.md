---
id: quickstart-tutorial
title: Quickstart Tutorial
sidebar_label: Quickstart Tutorial
---

# Quickstart Tutorial

In this quickstart, you’ll place a simple perp trade on Devnet in under five minutes:

1. **Initialize the Drift client (TypeScript example):**  
   ```ts
   import { Connection, Keypair } from '@solana/web3.js';
   import { DriftClient } from '@drift-labs/sdk';

   const connection = new Connection(process.env.DRIFT_RPC_URL!);
   const wallet = Keypair.fromSecretKey(
     Uint8Array.from(JSON.parse(process.env.WALLET_KEY!))
   );
   const driftClient = new DriftClient(connection, wallet, 'devnet');
   await driftClient.initialize();
   ```

2. **Create and subscribe to your user:**  
   ```ts
   await driftClient.addUser(0);
   await driftClient.subscribe();
   ```

3. **Deposit collateral:**  
   ```ts
   await driftClient.depositCollateral(100); // 100 USDC
   ```

4. **Place a small perp order:**  
   ```ts
   const marketIndex = 0; // (for example, the first perp market)
   const orderParams = {
     marketIndex,
     baseAssetAmount: 1_000_000, // 0.001 BTC (in lamports)
     price: 60000 * 1e6, // 60k USD
     side: 'openLong',
   };
   await driftClient.placePerpOrder(orderParams);
   ```

5. **Check your position PnL:**  
   ```ts
   const positionInfo = await driftClient.getUserPositions();
   console.log(positionInfo);
   ```

Congratulations—you’ve made your first programmatic trade! 🎉
