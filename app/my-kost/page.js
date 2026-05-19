import Link from "next/link";
import { requireSeller } from "@/lib/auth";
import { getUserListings } from "@/lib/data";

export const metadata = {
  title: "My Kost | Kos Escrow"
};

export default async function MyKostPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const user = await requireSeller();
  const listings = await getUserListings(user.id);
  const success = typeof resolvedSearchParams?.success === "string" ? resolvedSearchParams.success : "";

  return (
    <div className="shell py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Seller workspace</p>
          <h1 className="mt-3 text-3xl font-semibold">Manage the kost listings you posted</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--body)]">
            Seller accounts can publish kost listings here and wait for admin approval before they appear in the marketplace.
          </p>
        </div>
        <Link href="/my-kost/new" className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--primary-active)]">
          Post new kost
        </Link>
      </div>

      {success ? <p className="mt-6 rounded-2xl bg-[#eefaf2] px-4 py-3 text-sm text-[#166534]">{success}</p> : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {listings.length ? (
          listings.map((listing) => (
            <div key={listing.slug} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
              <p className="text-lg font-semibold">{listing.title}</p>
              <p className="mt-2 text-sm text-[var(--body)]">{listing.location}</p>
              <p className="mt-1 text-sm text-[var(--body)]">{listing.distance}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {getListingStatusLabel(listing.reviewStatus)}
              </p>
              <p className="mt-3 text-sm font-semibold">{listing.price} / month</p>
              <div className="mt-4 flex gap-3">
                <Link href={`/kost/${listing.slug}`} className="text-sm font-semibold text-[var(--primary)]">
                  View listing
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 text-sm text-[var(--body)]">
            You have not posted any kost listings yet.
          </div>
        )}
      </div>
    </div>
  );
}

function getListingStatusLabel(reviewStatus) {
  if (reviewStatus === "approved") {
    return "Approved and visible in marketplace";
  }

  if (reviewStatus === "rejected") {
    return "Denied by admin";
  }

  return "Pending admin approval";
}
