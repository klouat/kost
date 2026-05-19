import { PropertyCard } from "@/components/property-card";
import { MarketplaceFilterLinks, SearchBar } from "@/components/search-bar";
import { SectionTitle } from "@/components/section-title";
import { getCurrentUser } from "@/lib/auth";
import { getAllProperties } from "@/lib/data";

export const metadata = {
  title: "Marketplace | Kos Escrow"
};

export default async function MarketplacePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : "";
  const user = await getCurrentUser();
  const properties = await getAllProperties(query, user?.id || null);

  return (
    <div className="shell py-10">
      <SectionTitle
        eyebrow="Marketplace"
        title="Discover verified kos listings with full-rent ETH pricing"
        description="Browse the marketplace, search by location, and open each kost detail page before paying the full monthly rent through escrow."
      />

      <section className="mt-6 rounded-[32px] border border-[var(--border)] bg-[#fff8f8] p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Marketplace navbar</p>
              <p className="text-sm text-[var(--body)]">
                {query ? `Showing results for "${query}"` : "Search by city, area, campus, or kost name."}
              </p>
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{properties.length} listings</p>
          </div>
          <SearchBar defaultValue={query} />
          <MarketplaceFilterLinks />
        </div>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {!properties.length ? (
        <div className="mt-10 rounded-[28px] border border-[var(--border)] bg-white p-8 text-center">
          <h2 className="text-2xl font-semibold">No kost listings matched that search.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--body)]">
            Try another city, campus area, or shorter keyword.
          </p>
        </div>
      ) : null}
    </div>
  );
}
