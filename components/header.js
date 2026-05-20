import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export async function Header() {
  const user = await getCurrentUser();
  const navItems = buildNavItems(user);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur">
      <div className="shell flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
            KE
          </span>
          <div>
            <p className="text-base font-semibold">Kos Escrow</p>
            <p className="text-xs text-[var(--muted)]">Marketplace and escrow for kost rentals</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-[var(--foreground)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                href="/login"
                className="inline-flex min-w-[96px] items-center justify-center whitespace-nowrap rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex min-w-[112px] items-center justify-center whitespace-nowrap rounded-full bg-[#222222] px-4 py-2 text-sm font-medium text-white"
              >
                Register
              </Link>
            </>
          ) : (
            <ProfileMenu user={user} />
          )}
        </div>
      </div>
    </header>
  );
}

function buildNavItems(user) {
  const items = [
    { href: "/", label: "Home" },
    { href: "/marketplace", label: "Marketplace" }
  ];

  if (user) {
    if (user.role === "buyer") {
      items.push({ href: "/bookmarks", label: "Bookmarks" });
      items.push({ href: "/chat", label: "Chat" });
      return items;
    }

    if (user.role === "seller") {
      items.push({ href: "/dashboard", label: "Dashboard" });
      items.push({ href: "/transactions", label: "Transactions" });
      items.push({ href: "/chat", label: "Chat" });
      items.push({ href: "/my-kost", label: "My Kost" });
      return items;
    }

    if (user.role === "admin") {
      items.push({ href: "/admin", label: "Dashboard" });
      return items;
    }
  }

  return items;
}

function ProfileMenu({ user }) {
  const menuItems = buildProfileMenuItems(user);

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)]">
        {user.profileImageUrl ? (
          <Image
            src={user.profileImageUrl}
            alt={user.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-soft)] text-xs font-semibold">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden sm:inline">{user.name}</span>
        <span className="text-xs text-[var(--muted)] transition group-open:rotate-180">▾</span>
      </summary>

      <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 min-w-[220px] rounded-[24px] border border-[var(--border)] bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
        <div className="border-b border-[var(--border)] px-3 py-3">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{user.role}</p>
        </div>

        <div className="py-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-3 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-2">
          <form action={logoutAction}>
            <button
              type="submit"
              className="block w-full rounded-2xl px-3 py-3 text-left text-sm font-medium text-[#b42318] transition hover:bg-[#fff5f5]"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}

function buildProfileMenuItems(user) {
  if (user.role === "buyer") {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/bookmarks", label: "Bookmarks" },
      { href: "/chat", label: "Chat" },
      { href: "/transactions", label: "Transactions" },
      { href: "/settings", label: "Settings" }
    ];
  }

  if (user.role === "seller") {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/transactions", label: "Transactions" },
      { href: "/chat", label: "Chat" },
      { href: "/my-kost", label: "My Kost" },
      { href: "/settings", label: "Settings" }
    ];
  }

  return [{ href: "/settings", label: "Settings" }];
}
