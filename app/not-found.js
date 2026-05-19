import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Missing listing</p>
      <h1 className="mt-4 text-4xl font-semibold">That property could not be found.</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-[var(--body)]">
        The dynamic route is in place, but this listing ID is not in the current mock dataset.
      </p>
      <Link href="/marketplace" className="mt-8 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white">
        Return to marketplace
      </Link>
    </div>
  );
}
