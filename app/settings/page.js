import Image from "next/image";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { requireUser } from "@/lib/auth";
import { updateSettingsAction } from "@/app/settings/actions";

export const metadata = {
  title: "Settings | Kos Escrow"
};

export default async function SettingsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const user = await requireUser();
  const error = typeof resolvedSearchParams?.error === "string" ? resolvedSearchParams.error : "";
  const success = typeof resolvedSearchParams?.success === "string" ? resolvedSearchParams.success : "";

  return (
    <div className="shell py-10">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[var(--border)] bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">User settings</p>
        <h1 className="mt-3 text-3xl font-semibold">Update your name and profile picture</h1>

        {error ? <p className="mt-4 rounded-2xl bg-[#fff1f3] px-4 py-3 text-sm text-[#b32505]">{error}</p> : null}
        {success ? <p className="mt-4 rounded-2xl bg-[#eefaf2] px-4 py-3 text-sm text-[#166534]">{success}</p> : null}

        <div className="mt-6 flex items-center gap-4">
          {user.profileImageUrl ? (
            <Image src={user.profileImageUrl} alt={user.name} width={72} height={72} className="h-[72px] w-[72px] rounded-full object-cover" />
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--surface-soft)] text-xl font-semibold">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-[var(--body)]">{user.email}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{user.role}</p>
          </div>
        </div>

        <form action={updateSettingsAction} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium">Display name</span>
            <input
              type="text"
              name="name"
              defaultValue={user.name}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Upload profile picture</span>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
            />
            <p className="mt-2 text-sm text-[var(--body)]">
              Profile pictures are upload-only. Leave this empty if you want to keep your current image.
            </p>
          </label>
          <AuthSubmitButton
            idleLabel="Save settings"
            pendingLabel="Saving..."
            className="rounded-full bg-[#222222] px-6 py-3 text-sm font-semibold text-white"
          />
        </form>
      </div>
    </div>
  );
}
