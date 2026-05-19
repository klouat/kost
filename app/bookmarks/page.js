import { redirect } from "next/navigation";
import { PropertyCard } from "@/components/property-card";
import { SectionTitle } from "@/components/section-title";
import { requireUser } from "@/lib/auth";
import { getSavedPropertiesForUser } from "@/lib/data";

export const metadata = {
  title: "Bookmarks | Kos Escrow"
};

export default async function BookmarksPage() {
  const user = await requireUser();

  if (user.role !== "buyer") {
    redirect("/dashboard");
  }

  const properties = await getSavedPropertiesForUser(user.id);

  return (
    <div className="shell py-10">
      <SectionTitle
        eyebrow="Bookmarks"
        title="Saved kost listings for later review"
        description="Keep your shortlist here while comparing rent, location, and move-in options."
      />

      {properties.length ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[28px] border border-[var(--border)] bg-white p-8 text-center">
          <h2 className="text-2xl font-semibold">No bookmarked kost yet.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--body)]">
            Save listings from the marketplace to build your shortlist here.
          </p>
        </div>
      )}
    </div>
  );
}
