# Drift Vaults
Drift Vaults are permissionless programs that let users deposit and withdraw tokens from a shared pool managed by a single delegate. The delegate can only place or cancel orders on behalf of the vault, with no access to user funds.

A more indepth explanation of vaults can be found on the [wiki](https://github.com/drift-labs/drift-vaults/wiki).

## Vault cli
Anyone can setup their own vault with desired configuration. The cli utility to aid in the creation of vaults, can be found [here](https://github.com/drift-labs/drift-vaults/tree/master/ts/sdk).

### Clone and install dependencies for the cli
```typescript
git clone git@github.com:drift-labs/drift-vaults.git
cd ts/sdk
yarn
yarn cli --help
```
## Manager commands
The following commands are meant to be run by Vault Managers.

### Initialize a new vault
This will initialize a new vault and update the manager as the delegate, unless --delegate is specified.
Note that vault name must be unique.

| Option | Type | Description | Default |
|---------------|------|-------------|---------|
| `-n`, `--name` | `<string>` | Name of the vault to create | — |
| `-i`, `--market-index` | `<number>` | Spot market index to accept for deposits (0 = USDC) | `"0"` |
| `-r`, `--redeem-period` | `<number>` | Period (in seconds) depositors must wait after requesting a withdrawal | `"604800"` (7 days) |
| `-x`, `--max-tokens` | `<number>` | Maximum number of tokens (by market index) the vault can accept (0 = unlimited) | `"0"` |
| `-m`, `--management-fee` | `<percent>` | Annualized management fee charged to depositors | `"0"` |
| `-s`, `--profit-share` | `<percent>` | Percentage of profits charged by the manager | `"0"` |
| `-p`, `--permissioned` | *flag* | Makes the vault permissioned; depositors must be initialized by the manager | `false` |
| `-a`, `--min-deposit-amount` | `<number>` | Minimum token amount allowed for deposit | `"0"` |
| `-d`, `--delegate` | `<publicKey>` | Address to be set as the delegate of the vault | — |
| `-h`, `--help` | *flag* | Display help information for this command | — |

```bash
//This creates a new vault that takes SOL, with a redeem-period of 3600 seconds, max vault capacity of 10000 SOL, 2% management fee, 20% //profit share fee, is permissioned (whitelist required), and has a min deposit of 1 SOL.

yarn cli init-vault \
--name "test vault" \
--market-index 1 \
--redeem-period 3600 \
--max-tokens 10000 \
--management-fee 2 \
--profit-share 20 \
--permissioned \
--min-deposit-amount 1 \
--url <your RPC url> \
--keypair ~/.config/solana/keypair.json
```

### Update vault
To update params in a vault:

| Option / Flag | Type | Description |
|---------------|------|-------------|
| `--vault-address` | `<address>` | Address of the vault to update |
| `-r`, `--redeem-period` | `<number>` | New redeem period in seconds (can only be lowered) |
| `-x`, `--max-tokens` | `<number>` | Max tokens the vault can accept |
| `-a`, `--min-deposit-amount` | `<number>` | Minimum token amount allowed to deposit |
| `-m`, `--management-fee` | `<percent>` | New management fee (can only be lowered) |
| `-s`, `--profit-share` | `<percent>` | New profit share percentage (can only be lowered) |
| `-p`, `--permissioned` | `<boolean>` | Set the vault as permissioned (`true`) or open (`false`)(default) |
| `-h`, `--help` | *flag* | Display help information for this command |

```bash
yarn cli manager-update-vault \
--vault-address <vault_address> \
--redeem-period 1000 \
--max-tokens 200000 \
--management-fee 0 \
--profit-share 0 \
--url <your RPC url> \
--keypair ~/.config/solana/keypair.json
```

### Update margin trading
If you wish to trade with spot margin on the vault, you must enable margin trading:
```bash
yarn cli manager-update-margin-trading-enabled --vault-address=<VAULT_ADDRESS> --enabled=<true|false>
```

### Manager Deposit

Make a deposit into a vault as the manager (`DEPOSIT_AMOUNT` in human precision, e.g. 5 for 5 USDC):
```bash
yarn cli manager-deposit --vault-address=<VAULT_ADDRESS> --amount=<DEPOSIT_AMOUNT>
```

### Manager Withdraw

Make a withdraw request from a vault as the manager (`SHARES` in raw precision):
```bash
yarn cli manager-request-withdraw --vault-address=<VAULT_ADDRESS> --amount=<SHARES>
```

After the redeem period has passed, the manager can complete the withdraw:
```bash
yarn cli manager-withdraw --vault-address=<VAULT_ADDRESS>
```

## Depositor Commands

### Deposit into a vault

#### Permissioned Vaults

Permissioned vaults require the __manager__ to initialize the `VaultDepositor` account before a depositor can deposit.

Initialize a `VaultDepositor` account for `AUTHORITY_TO_ALLOW_DEPOSIT` to deposit:
```
yarn cli init-vault-depositor --vault-address=<VAULT_ADDRESS> --deposit-authority=<AUTHORITY_TO_ALLOW_DEPOSIT>
```


#### Permissioneless Vaults

Permissionless vaults allow anyone to deposit. The `deposit` instruction will initialize a `VaultDepositor` account if one does not exist.
`DEPOSIT_AMOUNT` in human precision of the deposit token (e.g. 5 for 5 USDC).

```
yarn cli deposit --vault-address=<VAULT_ADDRESS> --deposit-authority=<DEPOSIT_AUTHORITY> --amount=<DEPOSIT_AMOUNT>
```

Alternatively, you can pass in the `VaultDepositor` address directly:
```
yarn cli deposit --vault-depositor-address=<VAULT_DEPOSITOR_ADDRESS> --amount=<DEPOSIT_AMOUNT>
```

### Withdraw from a vault

Request a withdraw from a vault:
```
yarn cli request-withdraw --vault-address=<VAULT_ADDRESS> --authority=<AUTHORITY> --amount=<WITHDRAW_AMOUNT>
```

After the redeem period has passed, the depositor can complete the withdraw:
```
yarn cli withdraw --vault-address=<VAULT_ADDRESS> --authority=<AUTHORITY>
```

## View only commands

To print out the current state of a `Vault`:
```
yarn cli view-vault --vault-address=<VAULT_ADDRESS>
```

To print out the current state of a `VaultDepositor`:
```
yarn cli view-vault-depositor --vault-depositor-address=<VAULT_DEPOSITOR_ADDRESS>
```
