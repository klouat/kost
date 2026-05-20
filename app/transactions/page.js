import Link from "next/link";
import { SectionTitle } from "@/components/section-title";
import { requireUser } from "@/lib/auth";
import { getUserTransactions } from "@/lib/data";

export const metadata = {
  title: "Transactions | Kos Escrow"
};

export default async function TransactionsPage() {
  const user = await requireUser();
  const transactions = await getUserTransactions(user.id);

  return (
    <div className="shell py-10">
      <SectionTitle
        eyebrow="My transactions"
        title="Track your renter and owner activity"
        description="This list only shows transactions connected to your account, either as the renter paying full monthly rent or as the owner receiving it."
      />

      <div className="mt-8 overflow-hidden rounded-[32px] border border-[var(--border)] bg-white">
        <div className="hidden grid-cols-7 gap-4 border-b border-[var(--border)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] md:grid">
          <span>Property</span>
          <span>Role</span>
          <span>Status</span>
          <span>Amount</span>
          <span>Wallet</span>
          <span>Hash</span>
          <span>Chat</span>
        </div>
        {transactions.length ? (
          transactions.map((transaction) => (
            <div
              key={transaction.hash}
              className="grid grid-cols-1 gap-3 border-b border-[var(--border)] px-6 py-5 text-sm last:border-b-0 md:grid-cols-7 md:items-center"
            >
              <span className="font-semibold">{transaction.property}</span>
              <span className="text-[var(--body)]">{transaction.side}</span>
              <span className="text-[var(--body)]">{transaction.status}</span>
              <span>{transaction.amount}</span>
              <span className="text-[var(--body)]">{transaction.wallet}</span>
              <span className="truncate text-[var(--primary)]">{transaction.hash}</span>
              {transaction.chatThreadId ? (
                <Link
                  href={`/chat?thread=${transaction.chatThreadId}`}
                  className="inline-flex w-fit rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--primary-active)]"
                >
                  {transaction.side === "Renter" ? "Chat seller" : "Chat buyer"}
                </Link>
              ) : (
                <span className="text-xs text-[var(--muted)]">Chat unlocks after payment</span>
              )}
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-sm text-[var(--body)]">No transactions are attached to your account yet.</div>
        )}
      </div>
    </div>
  );
}
