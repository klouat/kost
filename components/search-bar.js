import Link from "next/link";

export const marketplaceFilters = ["Jakarta", "Bandung", "Yogyakarta", "Near campus", "Verified owner"];

export function SearchBar({ defaultValue = "" }) {
  return (
    <form action="/marketplace" className="card-shadow flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-white p-3 md:flex-row md:items-center md:gap-2">
      <label className="min-w-0 flex-1 rounded-full px-5 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Where</p>
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search city, area, campus, or kost"
          className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
        />
      </label>
      <SearchDivider />
      <SearchStatic label="When" value="Flexible move-in" />
      <SearchDivider />
      <SearchStatic label="Who" value="1 tenant" />
      <button
        type="submit"
        className="flex h-12 min-w-12 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-white"
      >
        Search
      </button>
    </form>
  );
}

export function MarketplaceFilterLinks() {
  return (
    <div className="flex flex-wrap gap-3">
      {marketplaceFilters.map((filter) => (
        <Link
          key={filter}
          href={`/marketplace?q=${encodeURIComponent(filter)}`}
          className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-medium text-[var(--foreground)]"
        >
          {filter}
        </Link>
      ))}
    </div>
  );
}

function SearchStatic({ label, value }) {
  return (
    <div className="min-w-0 flex-1 rounded-full px-5 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="truncate text-sm text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function SearchDivider() {
  return <div className="hidden h-10 w-px bg-[var(--border)] md:block" aria-hidden="true" />;
}
