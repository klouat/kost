import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { getCurrentUser } from "@/lib/auth";
import { loginAction } from "@/app/login/actions";

export const metadata = {
  title: "Login | Kos Escrow"
};

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const user = await getCurrentUser();
  const error = typeof resolvedSearchParams?.error === "string" ? resolvedSearchParams.error : "";

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="shell py-14">
      <div className="mx-auto max-w-md rounded-[32px] border border-[var(--border)] bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Welcome back</p>
        <h1 className="mt-3 text-3xl font-semibold">Login to continue renting or posting kost listings</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--body)]">
          Use your account to browse, post listings, track transactions, and manage your settings.
        </p>

        {error ? <p className="mt-4 rounded-2xl bg-[#fff1f3] px-4 py-3 text-sm text-[#b32505]">{error}</p> : null}

        <form action={loginAction} className="mt-6 space-y-4">
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
              placeholder="Your password"
              required
            />
          </label>
          <AuthSubmitButton
            idleLabel="Login"
            pendingLabel="Logging in..."
            className="w-full rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white"
          />
        </form>

        <div className="mt-6 rounded-2xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--body)]">
          <p className="font-semibold text-[var(--foreground)]">Demo accounts</p>
          <p className="mt-2">Buyer: buyer@kosescrow.local / Buyer123!</p>
          <p>Seller: seller@kosescrow.local / Seller123!</p>
          <p>Admin: admin@kosescrow.local / Admin123!</p>
        </div>

        <p className="mt-6 text-sm text-[var(--body)]">
          Need an account?{" "}
          <Link href="/register" className="font-semibold text-[var(--primary)]">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
