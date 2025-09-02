## Overview

Drift’s Builder Code (DBC) system enables any builder to build on top of Drift **while earning fees** for routing trades.

Drift Builder Codes establish the financial infrastructure layer on Solana, by allowing anyone tap into Drift’s deep liquidity and efficient execution, without building their own backend. This enables a fully open, composable UI layer for perps on Solana.

This Builder Code system makes Drift the first on-chain DEX on Solana to offer **per order monetization** for third-party frontends, setting the stage for a permissionless ecosystem of apps, bots, and aggregators all aligned with Drift and Solana’s liquidity growth. 

### Getting started with DBC

- **Builder Registration:**
In order to receive fees, builders are required to have an existing Drift account, as well as set up a `RevenueShareAccount`

- **User Onboarding:**  
Before placing any orders, users must approve the builder and the maximum allowed builder fee.  
This approval is stored directly inside the `RevenueShareEscrow` account.

### How Builder Codes Work

1. **Order Placement**  
   The builder’s app constructs a `place_order` transaction, which includes their `builderIdx` and `builderFee` in the signed order params 
   The `RevenueShareEscrow` account is included in the transaction so the program can validate and record the order.

2. **Fee Accrual (Per Order)**  
When an order is filled, the fee is credited to the user’s `RevenueShareEscrow` as a `RevenueShareOrder`:
   - This tracks builder’s pubkey, `feesAccrued`, `orderId`, `feeBps`, market type (spot or perp), and completion status.
   - Fees remain in escrow until settlement.

3. **Settlement**  
   On `settle_pnl`, any accrued fees in the escrow are swept to the builder’s `RevenueShareAccount`:

### Notes on builder codes for MM’s

**RevenueShareEscrow Inclusion:**  Fillers and market makers must include the user’s `RevenueShareEscrow` account in every order fill transaction. This PDA is derived from the user’s pubkey (requires no additional RPC calls).

**Multi Builder Support:**  Users can approve multiple builders, so MM’s may see multiple builder accounts to sweep to during `SettlePnl`. The protocol will not throw if a specific builder is omitted, but all filled rewards must eventually be swept.

**Error Handling:**  If a required escrow account isn’t included, the program will throw. Therefore it's recommended to always include it.

### FAQ

**Q: Can a user approve multiple builders?**  
A: Yes. Each builder entry in `approvedBuilders` has its own max fee bps.

**Q: How are builder fees capped?**  
A: A: The protocol enforces the user-approved max fee per builder. Attempts to go over will result in a transaction failure.

**Q: Do MM’s or fillers need to know the builder/referrer accounts for every order?**  
A: No, but including the `RevenueShareEscrow` is required to process reward accrual and settlement.

**Q: When are builder rewards paid?**  
A: On the user’s `settle_pnl` call (which sweeps escrowed fees to the builder).
