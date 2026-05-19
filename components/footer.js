const footerColumns = [
  {
    title: "Support",
    links: ["Escrow help center", "Trust and safety", "Deposit disputes"]
  },
  {
    title: "Hosting",
    links: ["List your kos", "Owner verification", "Occupancy confirmation"]
  },
  {
    title: "Platform",
    links: ["Admin review", "Sepolia setup", "Smart contract roadmap"]
  }
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--border)] bg-white">
      <div className="shell grid gap-8 px-0 py-12 md:grid-cols-3">
        {footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="text-base font-semibold">{column.title}</h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--body)]">
              {column.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="shell flex flex-col gap-2 py-5 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <p>© 2026 Kos Escrow. Built with Next.js, Tailwind, ethers.js, MetaMask, and Sepolia.</p>
          <p>English (US) · ETH · Privacy · Terms</p>
        </div>
      </div>
    </footer>
  );
}
