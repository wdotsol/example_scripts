---
id: environment-setup
title: Environment Setup
sidebar_label: Environment Setup
---

# Environment Setup

To set up your local development environment:

1. **Generate a Solana keypair.**  
   ```bash
   solana-keygen new --outfile ~/.config/solana/id.json
   ```
2. **Install the Drift TypeScript SDK (or Python SDK).**  
   - **TypeScript:**  
     ```bash
     yarn add @drift-labs/sdk
     ```  
   - **Python:**  
     ```bash
     pip install driftpy
     ```
3. **Configure your RPC endpoint.**  
   ```bash
   export DRIFT_RPC_URL=https://api.mainnet-beta.solana.com
   ```
   > **Note:** For production, we recommend using a dedicated RPC (e.g., QuickNode, Alchemy). Avoid public endpoints for reliability.
4. **Set program IDs.**  
   Drift program IDs (mainnet-beta):  
   | Environment    | Program ID                                                       | UI                         |
   | -------------- | ----------------------------------------------------------------- | -------------------------- |
   | mainnet-beta   | [dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH](https://solscan.io/account/dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH) | [app.drift.trade](https://app.drift.trade) |
   | devnet         | [dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH](https://solscan.io/account/dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH?cluster=devnet) | [beta.drift.trade](https://beta.drift.trade) |
