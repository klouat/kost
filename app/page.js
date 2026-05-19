import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { PropertyCard } from "@/components/property-card";
import { SectionTitle } from "@/components/section-title";
import { getCurrentUser } from "@/lib/auth";
import { getFeaturedProperties } from "@/lib/data";
import { platformStats, workflowSteps } from "@/lib/mock-data";

export default async function HomePage() {
  const user = await getCurrentUser();
  const featuredProperties = await getFeaturedProperties(user?.id || null);

  return (
    <div className="pb-20">
      <section className="shell pt-8 pb-10 md:pt-12">
        <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white">
          <div className="grid gap-10 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
                Sepolia escrow marketplace
              </span>
              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-balance md:text-6xl">
                  Rent verified kos with escrow protection before move-in.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--body)] md:text-lg">
                  Kos Escrow combines a warm consumer marketplace with full-rent ETH payments so tenants,
                  owners, and admins can track every booking milestone with confidence.
                </p>
              </div>
              <SearchBar />
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/marketplace"
                  className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-active)]"
                >
                  Browse marketplace
                </Link>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
                  >
                    Open dashboard
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="rounded-full border border-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
                  >
                    Create account
                  </Link>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {platformStats.map((stat) => (
                <div
                  key={stat.label}
                  className="card-shadow rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] p-6"
                >
                  <p className="text-sm font-medium text-[var(--muted)]">{stat.label}</p>
                  <p className="mt-3 text-4xl font-semibold">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--body)]">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-8">
        <SectionTitle
          eyebrow="Featured homes"
          title="ETH-priced listings curated for students and young professionals"
          description="Every property here is seeded with owner, wallet, and monthly ETH rent data so the frontend is ready for blockchain payment wiring."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      <section className="shell py-14">
        <div className="rounded-[32px] bg-[#fff5f7] px-6 py-8 md:px-10 md:py-12">
          <SectionTitle
            eyebrow="Transaction flow"
            title="The rental journey follows the escrow sequence from the project brief"
            description="The UX maps directly to the documented contract lifecycle so buyers, owners, and admins all see the same milestones."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="rounded-[24px] bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                  Step {index + 1}
                </p>
                <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--body)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
