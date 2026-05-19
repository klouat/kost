"use client";

import { useState } from "react";
import { connectWallet } from "@/lib/wallet";
import { REMIX_TENANT_WALLET_ADDRESS } from "@/lib/wallet-config";

export function WalletPanel() {
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState(`For the buyer Remix demo, connect MetaMask with ${REMIX_TENANT_WALLET_ADDRESS}.`);

  async function handleConnect() {
    try {
      setStatus("Requesting wallet access...");
      const address = await connectWallet();
      setWalletAddress(address);
      setStatus(
        address.toLowerCase() === REMIX_TENANT_WALLET_ADDRESS.toLowerCase()
          ? "Wallet connected. You can now pay rent with the Remix buyer account."
          : `Wrong wallet connected. Please switch to ${REMIX_TENANT_WALLET_ADDRESS}.`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet connection failed.");
    }
  }

  return (
    <section className="card-shadow rounded-[32px] border border-[var(--border)] bg-white p-6 md:p-8">
      <div className="space-y-3">
        <p className="text-sm font-medium text-[var(--muted)]">Required buyer wallet</p>
        <h2 className="text-lg font-semibold break-all">{REMIX_TENANT_WALLET_ADDRESS}</h2>
        <p className="text-sm text-[var(--body)]">MetaMask must connect to this exact address before the buyer can pay.</p>
        <p className="pt-2 text-sm font-medium text-[var(--muted)]">Currently connected account</p>
        <h2 className="text-2xl font-semibold">{walletAddress || "Not connected yet"}</h2>
        <p className="text-sm leading-6 text-[var(--body)]">{status}</p>
      </div>
      <button
        type="button"
        onClick={handleConnect}
        className="mt-6 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-active)]"
      >
        Connect Buyer MetaMask
      </button>
    </section>
  );
}
