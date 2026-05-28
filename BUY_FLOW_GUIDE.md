# Buyer Flow Guide

This guide explains how to set up and run the current buyer flow for this project.

It matches the current app behavior:

- buyer wallet is detected automatically from the connected MetaMask account during checkout
- buyer wallet does not need to be registered in Settings
- property prices use `monthly_rent_eth`
- transaction amounts use `transactions.amount_eth`
- old `deposit_eth` columns are removed

## What This Flow Does

1. Owner deploys the `KosEscrow` contract in Remix.
2. App is configured with the deployed contract address.
3. Buyer connects any MetaMask buyer wallet.
4. Buyer opens a kost detail page and pays rent through MetaMask.
5. App saves the transaction hash and payment status in MySQL.
6. Owner can later call `confirmOccupied()` from the owner wallet in Remix or another contract UI.

## Current Wallets

Use these addresses for the demo:

- Owner: `0x409f53Cf5Fe9c3EA6D5E6d0B593a359a0ad80794`

Important:

- The app detects the currently connected MetaMask account when the buyer starts payment.
- The connected buyer wallet is saved into `transactions.wallet_address`.
- The owner address is still fixed in the contract deployment and receives funds after `confirmOccupied()`.

## Contract Used In Remix

Use this contract in Remix:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract KosEscrow {
    address public tenant;
    address payable public owner;
    uint public depositAmount;
    bool public occupied;

    constructor(address payable _owner) {
        owner = _owner;
    }

    function payDeposit() public payable {
        require(msg.value > 0, "Deposit dibutuhkan");

        tenant = msg.sender;
        depositAmount = msg.value;
    }

    function confirmOccupied() public {
        require(msg.sender == owner, "Hanya pemilik yang bisa confirm");
        require(depositAmount > 0, "Tidak ada deposit");

        occupied = true;

        (bool success, ) = owner.call{value: depositAmount}("");
        require(success, "Transfer failed");
    }
}
```

Notes:

- The function name is still `payDeposit()`.
- In the current app, that function is used for the full rent payment.
- So the real payment amount comes from the kost price in `monthly_rent_eth`.

## Requirements

Before testing the flow, make sure you have:

- Laragon running
- MySQL running inside Laragon
- the `blockchain` database available
- MetaMask installed
- the buyer and owner accounts imported into MetaMask
- test ETH on the network you will use
- Remix available in browser
- this app running locally

## Database Setup

This project currently uses:

- database name: `blockchain`
- host: `127.0.0.1`
- port: `3306`
- user: `root`

The SQL schema already supports the current flow:

- `properties.monthly_rent_eth` is used for price
- `transactions.amount_eth` is used for paid amount
- both support `decimal(36,18)`

## App Environment Setup

Open `.env.local` and make sure it looks like this:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=blockchain
```

Replace `0xYOUR_DEPLOYED_CONTRACT_ADDRESS` after deploying the contract in Remix.

## Step 1: Start Laragon

1. Open Laragon.
2. Start MySQL.
3. Confirm the `blockchain` database exists.

If the app cannot read or save transactions, check MySQL first.

## Step 2: Deploy The Contract In Remix

1. Open Remix.
2. Create a new Solidity file or paste the contract above.
3. Compile with Solidity `0.8.20`.
4. Open the `Deploy & Run Transactions` panel.
5. Set `Environment` to `Injected Provider - MetaMask`.
6. In MetaMask, connect the owner wallet:
   `0x409f53Cf5Fe9c3EA6D5E6d0B593a359a0ad80794`
7. Deploy using constructor value:

```text
_owner = 0x409f53Cf5Fe9c3EA6D5E6d0B593a359a0ad80794
```

8. After deployment, copy the deployed contract address.

## Step 3: Put The Contract Address Into The App

1. Open `.env.local`.
2. Set:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

3. Restart the Next.js app if it is already running.

Example:

```bash
npm run dev
```

## Step 4: Make Sure A Kost Has A Price

Each kost needs a `monthly_rent_eth` value.

Examples:

- `0.01`
- `0.0001`
- `0.000000000000000001`

Important:

- Ethereum cannot send less than `1 wei`
- the smallest valid ETH amount is:

```text
0.000000000000000001
```

This is valid:

```text
0.000000000000000001
```

This is not valid:

```text
0.0000000000000000000000001
```

## Step 5: Connect The Buyer Wallet In MetaMask

1. Open MetaMask.
2. Switch to the buyer wallet you want to pay from.
3. Make sure this wallet has enough ETH for:
   - the rent amount
   - gas fees

## Step 6: Open The App And Pay

1. Open the app in browser.
2. Log in with a buyer account.
3. Open a kost detail page.
4. Click the payment button.
5. MetaMask will open.
6. Confirm the transaction.
7. Wait for the transaction to be mined.

What the app does after success:

- sends the payment through `payDeposit()`
- waits for `tx.wait()`
- saves a row in `transactions`
- stores:
  - `property_id`
  - `tenant_user_id`
  - `status`
  - `amount_eth`
  - `wallet_address`
  - `tx_hash`

## Step 7: Verify The Transaction In The App

After payment succeeds:

1. Open `/transactions`
2. Confirm the new transaction appears
3. Check that the status is shown
4. Check that the wallet matches the MetaMask account used during payment
5. Check that the tx hash is saved

The current saved status after payment is:

```text
Buyer has paid
```

This is the normal in-app verification step for this project.

## Step 8: Confirm Occupancy As Owner

When you want to release funds:

1. Go back to Remix.
2. Switch MetaMask to the owner wallet:
   `0x409f53Cf5Fe9c3EA6D5E6d0B593a359a0ad80794`
3. Open the deployed contract.
4. Call:

```text
confirmOccupied()
```

This will:

- require the caller to be the owner
- set `occupied = true`
- transfer the stored contract balance to the owner

## Buyer Flow Summary

1. Deploy contract with owner address.
2. Save deployed contract address in `.env.local`.
3. Start the app and Laragon MySQL.
4. Make sure the kost has `monthly_rent_eth`.
5. Connect MetaMask with the buyer wallet you want to use.
6. Pay from the kost detail page.
7. Verify the transaction in the app.
8. Confirm occupancy later from the owner wallet.

## Common Problems

### Wrong Buyer Wallet Connected

Problem:

- MetaMask is connected, but payment fails immediately.

Cause:

- the connected wallet is not available to the browser, is locked, or is not a valid Ethereum address

Fix:

- unlock MetaMask and reconnect the wallet from the kost detail page

### Contract Address Is Not Set

Problem:

- the app cannot interact with the contract

Fix:

- set `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`
- restart the app

### Buyer Has No ETH

Problem:

- MetaMask opens but transaction cannot be sent

Fix:

- fund the buyer wallet with test ETH

### Amount Too Small

Problem:

- you try to use a value smaller than `1 wei`

Fix:

- use at least:

```text
0.000000000000000001
```

### Transaction Not Saved In MySQL

Problem:

- MetaMask payment succeeds but `/transactions` does not update

Check:

- Laragon MySQL is running
- `.env.local` points to the correct database
- `DB_NAME=blockchain`

## Files Related To This Flow

- [components/deposit-widget.js](/D:/blokchen/components/deposit-widget.js:1)
- [lib/contract.js](/D:/blokchen/lib/contract.js:1)
- [app/api/transactions/route.js](/D:/blokchen/app/api/transactions/route.js:1)
- [lib/data.js](/D:/blokchen/lib/data.js:1)
- [lib/wallet-config.js](/D:/blokchen/lib/wallet-config.js:1)
- [database/init.sql](/D:/blokchen/database/init.sql:1)

## Recommended Next Improvement

The current setup works for a demo, but the contract only supports one stored payment state at a time.

If you want a cleaner production-style flow later, the next improvement should be:

- a dedicated rent payment function name
- contract events
- structured status values
- support for more than one transaction over time
