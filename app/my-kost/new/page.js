import { AuthSubmitButton } from "@/components/auth-submit-button";
import { ListingImageUpload } from "@/components/listing-image-upload";
import { requireSeller } from "@/lib/auth";
import { createKostAction } from "@/app/my-kost/new/actions";

export const metadata = {
  title: "Post Kost | Kos Escrow"
};

export default async function NewKostPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  await requireSeller();
  const error = typeof resolvedSearchParams?.error === "string" ? resolvedSearchParams.error : "";

  return (
    <div className="shell py-10">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[var(--border)] bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">New kost listing</p>
        <h1 className="mt-3 text-3xl font-semibold">Post a kost to the marketplace</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--body)]">
          Sellers can post listings here using uploaded images only, with a maximum of 10 images per listing.
        </p>

        {error ? <p className="mt-4 rounded-2xl bg-[#fff1f3] px-4 py-3 text-sm text-[#b32505]">{error}</p> : null}

        <form action={createKostAction} className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Kost title</span>
            <input type="text" name="title" className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Location</span>
            <input type="text" name="location" className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Distance / area note</span>
            <input type="text" name="distance" className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Monthly rent (ETH)</span>
            <input
              type="text"
              name="monthlyRentEth"
              inputMode="decimal"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
              placeholder="0.005"
              required
            />
            <p className="mt-2 text-sm text-[var(--body)]">
              Supports up to 18 decimal places. Smallest payable value is 0.005 ETH.
            </p>
          </label>
          <ListingImageUpload />
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Amenities</span>
            <input
              type="text"
              name="amenities"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
              placeholder="Wi-Fi, Private bath, Parking, Laundry"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <textarea
              name="description"
              rows="5"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
              required
            />
          </label>
          <div className="md:col-span-2">
            <AuthSubmitButton
              idleLabel="Publish kost"
              pendingLabel="Publishing..."
              className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
