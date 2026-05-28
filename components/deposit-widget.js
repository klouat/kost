"use client";

import Link from "next/link";
import { useState } from "react";
import { payRent } from "@/lib/contract";
import { detectOrConnectWallet } from "@/lib/wallet";

export function DepositWidget({ property, canPayRent, isOwner, existingTransaction }) {
  const [status, setStatus] = useState(getInitialStatus(existingTransaction));
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePayment() {
    try {
      setIsSubmitting(true);
      setStatus("Checking MetaMask...");
      const walletAddress = await detectOrConnectWallet();

      setStatus(`Detected MetaMask account ${walletAddress}. Opening the on-chain payment...`);
      const txHash = await payRent(String(property.monthlyRentEth));
      setStatus("Payment was confirmed on-chain. Saving the transaction record...");

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          propertySlug: property.slug,
          amountEth: property.monthlyRentEth,
          walletAddress,
          txHash,
          status: "Buyer has paid"
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Payment succeeded on-chain, but the app could not save the transaction.");
      }

      setStatus("Buyer has paid. You can now open Transactions and chat with the seller.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Payment failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card-shadow rounded-[28px] border border-[var(--border)] bg-white p-6">
      <p className="text-sm font-medium text-[var(--muted)]">Monthly rent</p>
      <h2 className="mt-2 text-3xl font-semibold">{property.price}</h2>
      <p className="mt-1 text-sm text-[var(--body)]">Full rent is paid in ETH through the escrow contract with MetaMask.</p>

      <div className="mt-6 space-y-3">
        <InfoRow label="Billing model" value="Full monthly rent" />
        <InfoRow label="Escrow network" value="Ethereum Sepolia" />
        <InfoRow label="Currency" value="ETH only" />
      </div>

      {!canPayRent ? (
        <Link
          href="/login"
          className="mt-6 block w-full rounded-2xl bg-[var(--foreground)] px-5 py-4 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#111111]"
        >
          Login to rent this kost
        </Link>
      ) : isOwner ? (
        <div className="mt-6 rounded-2xl bg-[var(--surface-soft)] px-5 py-4 text-sm font-medium text-[var(--body)]">
          This is your own listing, so the renter payment action is disabled here.
        </div>
      ) : existingTransaction ? (
        <div className="mt-6 rounded-2xl bg-[#eefaf2] px-5 py-4 text-sm font-medium text-[#166534]">
          Buyer has paid for this listing. Current status: {existingTransaction.status}.
        </div>
      ) : (
        <button
          type="button"
          onClick={handlePayment}
          disabled={isSubmitting}
          className="mt-6 w-full rounded-2xl bg-[var(--primary)] px-5 py-4 text-sm font-semibold text-white disabled:bg-[var(--primary-disabled)] hover:bg-[var(--primary-active)]"
        >
          {isSubmitting ? "Processing..." : `Pay ${property.price}`}
        </button>
      )}

      <p className="mt-4 text-sm leading-6 text-[var(--body)]">{status}</p>
    </section>
  );
}

function getInitialStatus(existingTransaction) {
  if (existingTransaction) {
    return `Buyer has paid. Current status: ${existingTransaction.status}.`;
  }

  return "Buyer hasn't paid yet. MetaMask will be detected automatically when you start payment.";
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-sm">
      <span className="text-[var(--body)]">{label}</span>
      <span className="font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}
