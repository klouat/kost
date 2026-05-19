import Link from "next/link";
import { notFound } from "next/navigation";
import { submitPropertyReviewAction } from "@/app/kost/[id]/actions";
import { DepositWidget } from "@/components/deposit-widget";
import { KostGallery } from "@/components/kost-gallery";
import { getCurrentUser } from "@/lib/auth";
import {
  canUserReviewProperty,
  getAllProperties,
  getPropertyBySlug,
  getPropertyReviews,
  getUserTransactionForProperty,
  getUserReviewForProperty
} from "@/lib/data";

export async function generateStaticParams() {
  const properties = await getAllProperties();

  return properties.map((property) => ({
    id: property.id
  }));
}

export default async function KostDetailPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const user = await getCurrentUser();
  const property = await getPropertyBySlug(resolvedParams.id, user?.id || null);

  const canViewPendingListing =
    property &&
    user &&
    (user.role === "admin" || property.ownerUserId === user.id);

  if (!property || (!property.verified && !canViewPendingListing)) {
    notFound();
  }

  const reviews = await getPropertyReviews(property.slug);
  const reviewSuccess = typeof resolvedSearchParams?.reviewSuccess === "string" ? resolvedSearchParams.reviewSuccess : "";
  const reviewError = typeof resolvedSearchParams?.reviewError === "string" ? resolvedSearchParams.reviewError : "";
  const canLeaveReview = user?.role === "buyer" ? await canUserReviewProperty(user.id, property.slug) : false;
  const existingReview = canLeaveReview ? await getUserReviewForProperty(user.id, property.slug) : null;
  const existingTransaction = user?.role === "buyer" ? await getUserTransactionForProperty(user.id, property.slug) : null;
  const submitReviewAction = submitPropertyReviewAction.bind(null, property.slug);

  return (
    <div className="shell py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/marketplace" className="font-medium text-[var(--foreground)]">
          Marketplace
        </Link>
        <span>/</span>
        <span>{property.title}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.65fr_0.95fr]">
        <div className="space-y-8">
          <section className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white">
            <KostGallery title={property.title} imageUrls={property.imageUrls} />
            <div className="space-y-4 px-6 py-6 md:px-8">
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 font-semibold text-[var(--foreground)]">
                  Guest favorite
                </span>
                <span>{property.location}</span>
                <span>{property.distance}</span>
                {property.reviewCount > 0 ? (
                  <>
                    <span>Rating {property.rating}</span>
                    <span>{property.reviewCount} review{property.reviewCount === 1 ? "" : "s"}</span>
                  </>
                ) : (
                  <span>No renter reviews yet</span>
                )}
              </div>
              <h1 className="text-3xl font-semibold md:text-4xl">{property.title}</h1>
              <p className="max-w-3xl text-base leading-7 text-[var(--body)]">{property.description}</p>
            </div>
          </section>

          <section className="rounded-[32px] border border-[var(--border)] bg-white p-6 md:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Amenities</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="rounded-2xl bg-[var(--surface-soft)] px-4 py-4 text-sm text-[var(--foreground)]">
                  {amenity}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-[var(--border)] bg-white p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Reviews</p>
                <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
                  {property.reviewCount > 0
                    ? `Rating ${property.rating} / ${property.reviewCount} review${property.reviewCount === 1 ? "" : "s"}`
                    : "No renter reviews yet"}
                </h2>
              </div>
              {!user ? <p className="text-sm text-[var(--body)]">Log in as a buyer to leave a review.</p> : null}
            </div>

            {reviewSuccess ? <p className="mt-6 rounded-2xl bg-[#eefaf2] px-4 py-3 text-sm text-[#166534]">{reviewSuccess}</p> : null}
            {reviewError ? <p className="mt-6 rounded-2xl bg-[#fff5f5] px-4 py-3 text-sm text-[#b42318]">{reviewError}</p> : null}

            {canLeaveReview ? (
              <form action={submitReviewAction} className="mt-6 space-y-4 rounded-[24px] bg-[var(--surface-soft)] p-5">
                <div className="grid gap-4 md:grid-cols-[180px_1fr] md:items-start">
                  <label className="block">
                    <span className="text-sm font-medium">Your rating</span>
                    <select
                      name="rating"
                      defaultValue={existingReview?.rating ? String(existingReview.rating) : "5"}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none"
                    >
                      <option value="5">5 stars</option>
                      <option value="4">4 stars</option>
                      <option value="3">3 stars</option>
                      <option value="2">2 stars</option>
                      <option value="1">1 star</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Your review</span>
                    <textarea
                      name="comment"
                      rows={4}
                      defaultValue={existingReview?.comment || ""}
                      placeholder="Share what the kost, owner response, and rent process felt like."
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-[#222222] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  {existingReview ? "Update review" : "Submit review"}
                </button>
              </form>
            ) : user?.role === "buyer" ? (
              <p className="mt-6 rounded-2xl bg-[var(--surface-soft)] px-4 py-4 text-sm text-[var(--body)]">
                You can leave a review after renting this kost through your buyer account.
              </p>
            ) : null}

            <div className="mt-8 space-y-4">
              {reviews.length ? (
                reviews.map((review, index) => (
                  <div key={`${review.reviewerName}-${review.createdAtLabel}-${index}`} className="rounded-[24px] border border-[var(--border)] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{review.reviewerName}</p>
                        <p className="mt-1 text-sm text-[var(--body)]">
                          {review.rating}/5 stars
                          <span className="ml-2 text-[var(--muted)]">{review.createdAtLabel}</span>
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
                        {review.rating}.0
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[var(--body)]">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-[var(--surface-soft)] px-4 py-4 text-sm text-[var(--body)]">
                  No renter reviews yet for this kost.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <DepositWidget
            property={property}
            canPayRent={Boolean(user)}
            isOwner={Boolean(user && property.ownerUserId === user.id)}
            existingTransaction={existingTransaction}
          />
        </aside>
      </div>
    </div>
  );
}
