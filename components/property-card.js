import Image from "next/image";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark-button";

export function PropertyCard({ property }) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-[var(--border)] bg-white transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]">
      <div className="relative">
        <Link href={`/kost/${property.id}`} className="block">
          <div className="relative h-72 w-full overflow-hidden">
            <Image
              src={property.imageUrl}
              alt={property.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />
            <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[var(--foreground)]">
              Guest favorite
            </span>
          </div>
        </Link>
        <BookmarkButton propertySlug={property.slug} initialIsSaved={property.isSaved} />
      </div>
      <Link href={`/kost/${property.id}`} className="block space-y-2 px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold">{property.title}</h3>
          {property.reviewCount > 0 ? (
            <span className="flex items-center gap-1 text-sm font-medium">
              <span aria-hidden="true">&#9733;</span>
              <span>{property.rating}</span>
            </span>
          ) : (
            <span className="text-sm font-medium text-[var(--muted)]">New</span>
          )}
        </div>
        <p className="text-sm text-[var(--muted)]">{property.location}</p>
        <p className="text-sm text-[var(--muted)]">{property.distance}</p>
        <p className="text-sm text-[var(--body)]">
          {property.reviewCount > 0 ? `${property.reviewCount} review${property.reviewCount === 1 ? "" : "s"}` : "No reviews yet"}
        </p>
        <p className="text-sm text-[var(--body)]">ETH-only monthly billing</p>
        <p className="pt-1 text-sm font-semibold">{property.priceLabel}</p>
        <p className="pt-1 text-sm font-semibold text-[var(--primary)]">View kost details</p>
      </Link>
    </article>
  );
}
