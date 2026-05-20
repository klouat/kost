import Link from "next/link";
import { redirect } from "next/navigation";
import { SectionTitle } from "@/components/section-title";
import { requireUser } from "@/lib/auth";
import { getUserDashboardData } from "@/lib/data";

export const metadata = {
  title: "Dashboard | Kos Escrow"
};

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === "admin") {
    redirect("/admin");
  }

  const dashboard = await getUserDashboardData(user.id);

  return (
    <div className="shell py-10">
      <SectionTitle
        eyebrow="Your dashboard"
        title={user.role === "seller" ? `Manage your listings, ${user.name}` : `Track your rentals, ${user.name}`}
        description={
          user.role === "seller"
            ? "Seller accounts can post kost listings, track approval status, and monitor incoming rental activity."
            : "Buyer accounts focus on browsing listings, starting rent payments, and tracking rental transactions."
        }
      />

      {user.role === "seller" ? (
        <>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <StatCard label="My listings" value={dashboard.summary.listing_count} />
            <StatCard label="Pending approval" value={dashboard.summary.pending_listing_count} />
            <StatCard label="Incoming owner transactions" value={dashboard.summary.owner_transaction_count} />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-[28px] border border-[var(--border)] bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--muted)]">Seller tools</p>
                  <h2 className="mt-2 text-2xl font-semibold">My kost listings</h2>
                </div>
                <Link href="/my-kost/new" className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-active)]">
                  Post new kost
                </Link>
              </div>
              <div className="mt-5 space-y-3">
                {dashboard.listings.length ? (
                  dashboard.listings.slice(0, 4).map((listing) => (
                    <div key={listing.slug} className="rounded-2xl bg-[var(--surface-soft)] px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{listing.title}</p>
                          <p className="text-sm text-[var(--body)]">{listing.location}</p>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                            {getSellerListingStatusLabel(listing.reviewStatus)}
                          </p>
                        </div>
                        <Link href={`/kost/${listing.slug}`} className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-active)]">
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl bg-[var(--surface-soft)] px-4 py-4 text-sm text-[var(--body)]">
                    You have not posted a kost yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-[var(--border)] bg-white p-6">
              <p className="text-sm font-medium text-[var(--muted)]">Quick actions</p>
              <h2 className="mt-2 text-2xl font-semibold">Seller shortcuts</h2>
              <div className="mt-5 space-y-3">
                <QuickLink href="/my-kost/new" label="Post a new kost" />
                <QuickLink href="/my-kost" label="Manage my kost posts" />
                <QuickLink href="/transactions" label="Review incoming transactions" />
                <QuickLink href="/settings" label="Update profile and avatar" />
              </div>
            </section>
          </div>
        </>
      ) : (
        <>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <StatCard label="Rentals as buyer" value={dashboard.summary.renter_transaction_count} />
            <StatCard label="Saved profile" value={1} />
            <StatCard label="Buy flow" value="Auto detect" />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[28px] border border-[var(--border)] bg-white p-6">
              <p className="text-sm font-medium text-[var(--muted)]">Buyer focus</p>
              <h2 className="mt-2 text-2xl font-semibold">Rental activity</h2>
              <div className="mt-5 space-y-3">
                {dashboard.transactions.length ? (
                  dashboard.transactions.slice(0, 4).map((transaction) => (
                    <div key={transaction.hash} className="rounded-2xl bg-[var(--surface-soft)] px-4 py-4">
                      <p className="font-semibold">{transaction.property}</p>
                      <p className="text-sm text-[var(--body)]">{transaction.status}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{transaction.amount}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl bg-[var(--surface-soft)] px-4 py-4 text-sm text-[var(--body)]">
                    You have not started a rental transaction yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-[var(--border)] bg-white p-6">
              <p className="text-sm font-medium text-[var(--muted)]">Quick actions</p>
              <h2 className="mt-2 text-2xl font-semibold">Buyer shortcuts</h2>
              <div className="mt-5 space-y-3">
                <QuickLink href="/marketplace" label="Browse marketplace" />
                <QuickLink href="/transactions" label="Review my rentals" />
                <QuickLink href="/settings" label="Update profile and avatar" />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function getSellerListingStatusLabel(reviewStatus) {
  if (reviewStatus === "approved") {
    return "Approved and live";
  }

  if (reviewStatus === "rejected") {
    return "Denied by admin";
  }

  return "Waiting for admin approval";
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white p-6">
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-4xl font-semibold">{value}</p>
    </div>
  );
}

function QuickLink({ href, label }) {
  return (
    <Link href={href} className="block rounded-2xl bg-[var(--surface-soft)] px-4 py-4 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:bg-[#f0f0f0]">
      {label}
    </Link>
  );
}
