import Link from "next/link";
import { SectionTitle } from "@/components/section-title";
import AdminTransactionApprovalButton from "@/components/admin-transaction-approval-button";
import { requireAdmin } from "@/lib/auth";
import { getAdminTransactions } from "@/lib/data";

export const metadata = {
  title: "Transaction Monitoring | Kos Escrow"
};

export default async function AdminTransactionsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  await requireAdmin();

  const status = typeof resolvedSearchParams?.status === "string" ? resolvedSearchParams.status : "";
  const query = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : "";
  const monitoring = await getAdminTransactions({ status, query });

  return (
    <div className="shell py-10">
      <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/admin" className="font-medium text-[var(--foreground)]">
          Dashboard
        </Link>
        <span>/</span>
        <span>Transaction monitoring</span>
      </div>

      <SectionTitle
        eyebrow="Admin monitoring"
        title="Track escrow activity across the marketplace"
        description="Review recent tx hashes, spot pending confirmations, and monitor owner-renter payment flow from one admin-only page."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-4">
        <StatCard label="All transactions" value={monitoring.summary.totalCount} />
        <StatCard label="Pending confirmations" value={monitoring.summary.pendingCount} />
        <StatCard label="Needs review" value={monitoring.summary.reviewCount} />
        <StatCard label="Completed" value={monitoring.summary.completedCount} />
      </div>

      <section className="mt-8 rounded-[28px] border border-[var(--border)] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Filters</h2>
            <p className="mt-2 text-sm text-[var(--body)]">
              Search by property, tx hash, wallet, renter, or owner. Use status filters to focus on stuck confirmations.
            </p>
          </div>

          <form className="grid gap-3 sm:grid-cols-[220px_1fr_auto]">
            <select
              name="status"
              defaultValue={status}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending confirmations</option>
              <option value="review">Needs review</option>
              <option value="completed">Completed</option>
            </select>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search hash, wallet, property, renter, owner"
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            />
            <button
              type="submit"
              className="rounded-2xl bg-[#222222] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Apply
            </button>
          </form>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[32px] border border-[var(--border)] bg-white">
        <div className="hidden grid-cols-[1.2fr_0.85fr_0.85fr_0.8fr_0.8fr_1fr_0.9fr] gap-4 border-b border-[var(--border)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] xl:grid">
          <span>Property</span>
          <span>Renter</span>
          <span>Owner</span>
          <span>Status</span>
          <span>Amount</span>
          <span>Wallet</span>
          <span>Tx hash</span>
        </div>

        {monitoring.transactions.length ? (
          monitoring.transactions.map((transaction) => (
            <div
              key={transaction.hash}
              className="grid grid-cols-1 gap-3 border-b border-[var(--border)] px-6 py-5 text-sm last:border-b-0 xl:grid-cols-[1.2fr_0.85fr_0.85fr_0.8fr_0.8fr_1fr_0.9fr] xl:items-center"
            >
              <div>
                <Link href={`/kost/${transaction.propertySlug}`} className="font-semibold text-[var(--foreground)] hover:text-[var(--primary)]">
                  {transaction.property}
                </Link>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{transaction.createdAt}</p>
              </div>
              <span className="text-[var(--body)]">{transaction.tenantName}</span>
              <span className="text-[var(--body)]">{transaction.ownerName}</span>
              <span className={getStatusClassName(transaction.operationalStatus)}>{getStatusLabel(transaction.operationalStatus)}</span>
              <span>{transaction.amount}</span>
              <span className="text-[var(--body)]">{transaction.wallet}</span>
              <span className="truncate text-[var(--primary)]" title={transaction.hash}>
                {transaction.hash}
              </span>
              {transaction.operationalStatus === "pending" ? (
                <div className="xl:col-span-full">
                  <AdminTransactionApprovalButton transactionId={transaction.id} />
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-sm text-[var(--body)]">No transactions matched the current filters.</div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white p-6">
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-4xl font-semibold">{value}</p>
    </div>
  );
}

function getStatusLabel(operationalStatus) {
  if (operationalStatus === "pending") {
    return "Pending";
  }

  if (operationalStatus === "completed") {
    return "Completed";
  }

  return "Needs review";
}

function getStatusClassName(operationalStatus) {
  if (operationalStatus === "pending") {
    return "inline-flex w-fit rounded-full bg-[#fff4e5] px-3 py-1 text-xs font-semibold text-[#b45309]";
  }

  if (operationalStatus === "completed") {
    return "inline-flex w-fit rounded-full bg-[#eefaf2] px-3 py-1 text-xs font-semibold text-[#166534]";
  }

  return "inline-flex w-fit rounded-full bg-[#fef2f2] px-3 py-1 text-xs font-semibold text-[#b42318]";
}
