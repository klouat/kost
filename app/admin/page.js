import Link from "next/link";
import { SectionTitle } from "@/components/section-title";
import { approveListingAction, denyListingAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview, getAdminTasks } from "@/lib/data";

export const metadata = {
  title: "Admin | Kos Escrow"
};

export default async function AdminPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  await requireAdmin();
  const adminTasks = await getAdminTasks();
  const overview = await getAdminOverview();
  const success = typeof resolvedSearchParams?.success === "string" ? resolvedSearchParams.success : "";

  return (
    <div className="shell py-10">
      <SectionTitle
        eyebrow="Admin controls"
        title="Review users, listings, and platform activity"
        description="This page is protected for admin users only and gives a snapshot of marketplace health plus review tasks."
      />

      {success ? <p className="mt-6 rounded-2xl bg-[#eefaf2] px-4 py-3 text-sm text-[#166534]">{success}</p> : null}

      <div className="mt-8 grid gap-6 md:grid-cols-4">
        <StatCard label="Regular users" value={overview.summary.regular_user_count} />
        <StatCard label="Admin users" value={overview.summary.admin_user_count} />
        <StatCard label="Properties" value={overview.summary.property_count} />
        <StatCard label="Pending approvals" value={overview.summary.pending_property_count} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-[var(--border)] bg-white p-6 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Pending listing approvals</h2>
              <p className="mt-2 text-sm text-[var(--body)]">
                New kost posts stay hidden from the marketplace until an admin approves them.
              </p>
            </div>
            <span className="rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              {overview.pendingListings.length} waiting
            </span>
          </div>
          <div className="mt-5 grid gap-4">
            {overview.pendingListings.length ? (
              overview.pendingListings.map((listing) => (
                <div key={listing.slug} className="rounded-2xl bg-[var(--surface-soft)] px-4 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold">{listing.title}</p>
                      <p className="text-sm text-[var(--body)]">{listing.location}</p>
                      <p className="text-sm text-[var(--body)]">
                        {listing.ownerName} - {listing.price} / month
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/kost/${listing.slug}`}
                        className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)]"
                      >
                        View details
                      </Link>
                      <form action={denyListingAction}>
                        <input type="hidden" name="slug" value={listing.slug} />
                        <button
                          type="submit"
                          className="rounded-full border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:-translate-y-0.5 hover:border-[#111827]"
                        >
                          Deny listing
                        </button>
                      </form>
                      <form action={approveListingAction}>
                        <input type="hidden" name="slug" value={listing.slug} />
                        <button
                          type="submit"
                          className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--primary-active)]"
                        >
                          Approve listing
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-[var(--surface-soft)] px-4 py-4 text-sm text-[var(--body)]">
                No listings are waiting for approval right now.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-white p-6">
          <h2 className="text-2xl font-semibold">Recent users</h2>
          <div className="mt-5 space-y-3">
            {overview.recentUsers.map((user) => (
              <div key={user.id} className="rounded-2xl bg-[var(--surface-soft)] px-4 py-4">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-[var(--body)]">{user.email}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{user.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-white p-6">
          <h2 className="text-2xl font-semibold">Recent listings</h2>
          <div className="mt-5 space-y-3">
            {overview.recentListings.map((listing) => (
              <div key={listing.slug} className="rounded-2xl bg-[var(--surface-soft)] px-4 py-4">
                <p className="font-semibold">{listing.title}</p>
                <p className="text-sm text-[var(--body)]">{listing.location}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {listing.owner_name || "Unknown owner"} - {getListingStatusLabel(listing.reviewStatus)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {adminTasks.map((task) => (
          <section key={task.title} className="rounded-[28px] border border-[var(--border)] bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--muted)]">{task.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold">{task.title}</h2>
              </div>
              <span className="rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                {task.title === "Property approval" ? `${overview.summary.pending_property_count} pending` : task.badge}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--body)]">{task.description}</p>
            <ul className="mt-5 space-y-3 text-sm">
              {task.items.map((item) => (
                <li key={item} className="rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
            {task.title === "Transaction monitoring" ? (
              <Link
                href="/admin/transactions"
                className="mt-5 inline-flex rounded-full bg-[#222222] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Open transaction monitoring
              </Link>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}

function getListingStatusLabel(reviewStatus) {
  if (reviewStatus === "approved") {
    return "Verified";
  }

  if (reviewStatus === "rejected") {
    return "Denied";
  }

  return "Pending";
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white p-6">
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-4xl font-semibold">{value}</p>
    </div>
  );
}
