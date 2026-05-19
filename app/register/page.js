import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { getCurrentUser } from "@/lib/auth";
import { registerAction } from "@/app/register/actions";

export const metadata = {
  title: "Register | Kos Escrow"
};

export default async function RegisterPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const user = await getCurrentUser();
  const error = typeof resolvedSearchParams?.error === "string" ? resolvedSearchParams.error : "";

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="shell py-14">
      <div className="mx-auto max-w-md rounded-[32px] border border-[var(--border)] bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Create account</p>
        <h1 className="mt-3 text-3xl font-semibold">Choose your role and create your account</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--body)]">
          Buyers can browse and rent kost listings. Sellers can post listings and manage approvals. Admin remains a separate role.
        </p>

        {error ? <p className="mt-4 rounded-2xl bg-[#fff1f3] px-4 py-3 text-sm text-[#b32505]">{error}</p> : null}

        <form action={registerAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input
              type="text"
              name="name"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
              placeholder="Your name"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              name="email"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              name="password"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
              placeholder="Minimum 8 characters"
              required
            />
          </label>
          <fieldset className="rounded-2xl border border-[var(--border)] p-4">
            <legend className="px-2 text-sm font-medium">Register as</legend>
            <div className="mt-2 grid gap-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 transition hover:border-[var(--primary)] hover:bg-[#fff7f8]">
                <input type="radio" name="role" value="buyer" defaultChecked className="mt-1" />
                <span>
                  <span className="block text-sm font-semibold">Buyer</span>
                  <span className="block text-sm text-[var(--body)]">Browse kost listings, pay full monthly rent in ETH, and track rentals.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 transition hover:border-[var(--primary)] hover:bg-[#fff7f8]">
                <input type="radio" name="role" value="seller" className="mt-1" />
                <span>
                  <span className="block text-sm font-semibold">Seller</span>
                  <span className="block text-sm text-[var(--body)]">Post kost listings, wait for admin approval, and manage incoming rentals.</span>
                </span>
              </label>
            </div>
          </fieldset>
          <AuthSubmitButton
            idleLabel="Register"
            pendingLabel="Creating account..."
            className="w-full rounded-full bg-[#222222] px-6 py-3 text-sm font-semibold text-white hover:bg-[#111111]"
          />
        </form>

        <p className="mt-6 text-sm text-[var(--body)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[var(--primary)]">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
