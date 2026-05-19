# Kos Escrow DApp Project

## Project Overview

Kos Escrow DApp is a blockchain-based property/kos rental escrow system built using:

- Next.js
- Tailwind CSS
- Solidity Smart Contract
- ethers.js
- MetaMask
- Ethereum Sepolia Testnet

The system allows tenants/buyers to safely pay deposits into an escrow smart contract before occupancy confirmation.

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Styling | Tailwind CSS |
| Blockchain Interaction | ethers.js |
| Wallet | MetaMask |
| Smart Contract | Solidity |
| Blockchain Network | Ethereum Sepolia |
| Deployment | Vercel |

---

# Features

## Buyer / Tenant

- Connect MetaMask Wallet
- Browse Property Listings
- View Property Detail
- Pay Deposit to Escrow
- Track Transaction Status

## Seller / Owner

- Upload Property
- Manage Properties
- View Incoming Deposits
- Confirm Occupancy
- Receive Escrow Funds

## Admin

- Verify Property Listings
- Monitor Transactions
- Manage Users
- Handle Disputes

---

# Smart Contract

## Solidity Contract

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

---

# Dashboard Structure

# Buyer Dashboard

## Pages

- Dashboard Home
- Marketplace
- Property Detail
- My Transactions
- Escrow Payment
- Wallet
- Notifications
- Profile

## Functions

- Connect MetaMask
- Pay Deposit
- View Escrow Status
- Track Blockchain Transaction

---

# Seller Dashboard

## Pages

- Dashboard Home
- Upload Property
- Manage Properties
- Incoming Transactions
- Wallet Transactions
- Profile

## Functions

- Upload Property
- View Buyer Deposits
- Confirm Occupied
- Receive Escrow Payment

---

# Admin Dashboard

## Pages

- Dashboard Home
- Property Verification
- User Management
- Transaction Monitoring
- Dispute Handling
- Reports

## Functions

- Verify Property
- Monitor Blockchain Transactions
- Manage Platform

---

# Suggested Next.js Folder Structure

```txt
/app
    /dashboard
    /marketplace
    /property/[id]
    /transactions
    /wallet
    /admin
/components
/lib
    contract.js
/public
/styles
```

---

# Install Dependencies

```bash
npm install ethers
```

---

# MetaMask Wallet Connection

```javascript
"use client";

async function connectWallet() {
    if (!window.ethereum) {
        alert("Install MetaMask");
        return;
    }

    await window.ethereum.request({
        method: "eth_requestAccounts",
    });

    console.log("Wallet Connected");
}
```

---

# Smart Contract Integration

## contract.js

```javascript
import { ethers } from "ethers";

export const contractAddress = "YOUR_CONTRACT_ADDRESS";

export const contractABI = [
  // ABI HERE
];

export async function getContract() {
    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    return new ethers.Contract(
        contractAddress,
        contractABI,
        signer
    );
}
```

---

# Pay Deposit Example

```javascript
import { ethers } from "ethers";
import { getContract } from "@/lib/contract";

async function payDeposit() {
    const contract = await getContract();

    const tx = await contract.payDeposit({
        value: ethers.parseEther("0.01")
    });

    await tx.wait();

    alert("Deposit Success");
}
```

---

# Confirm Occupied Example

```javascript
async function confirmOccupied() {
    const contract = await getContract();

    const tx = await contract.confirmOccupied();

    await tx.wait();

    alert("Occupancy Confirmed");
}
```

---

# Transaction Flow

1. Seller uploads property
2. Admin verifies property
3. Buyer views marketplace
4. Buyer connects MetaMask
5. Buyer pays escrow deposit
6. Smart contract stores deposit
7. Owner confirms occupancy
8. Smart contract releases funds
9. Transaction completed

---

# Future Improvements

- Multiple properties support
- Multiple escrow transactions
- Refund system
- Dispute system
- NFT ownership proof
- On-chain property history
- Admin smart contract
- Event logging
- IPFS document storage

---

# Deployment

## Frontend

Deploy using:

- Vercel

## Smart Contract

Deploy using:

- Remix IDE
- Sepolia Testnet

---

# Environment Variables

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

---

# Author

Kos Escrow DApp using Next.js + Solidity + MetaMask + ethers.js

