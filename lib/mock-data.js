export const featuredProperties = [
  {
    id: "sunrise-kebayoran",
    title: "Sunrise Kebayoran Studio",
    location: "South Jakarta, Indonesia",
    distance: "12 minutes to MRT",
    rating: "4.91",
    price: "Rp3.900.000",
    depositEth: "0.01",
    depositLabel: "0.01 ETH escrow deposit",
    gradient: "from-rose-200 via-orange-100 to-stone-100",
    description:
      "A polished studio for city renters who want predictable move-in protection, responsive owners, and a clear escrow release flow.",
    amenities: ["Private bathroom", "Wi-Fi included", "Access card lobby", "Verified owner", "Monthly cleaning", "Sepolia demo ready"]
  },
  {
    id: "tugu-loft",
    title: "Tugu Creative Loft",
    location: "Yogyakarta, Indonesia",
    distance: "8 minutes to campus",
    rating: "4.88",
    price: "Rp2.750.000",
    depositEth: "0.008",
    depositLabel: "0.008 ETH escrow deposit",
    gradient: "from-amber-200 via-orange-100 to-pink-100",
    description:
      "Designed for students and indie workers who want a warmer, flexible kos setup with clear owner obligations before funds are released.",
    amenities: ["Desk setup", "Shared kitchen", "Fast internet", "CCTV access", "Verified documents", "Move-in checklist"]
  },
  {
    id: "dago-garden",
    title: "Dago Garden Room",
    location: "Bandung, Indonesia",
    distance: "15 minutes to ITB",
    rating: "4.95",
    price: "Rp3.150.000",
    depositEth: "0.009",
    depositLabel: "0.009 ETH escrow deposit",
    gradient: "from-lime-200 via-emerald-100 to-teal-100",
    description:
      "A calmer hillside property with reliable landlords, verified compliance, and a transaction trail that both tenant and owner can audit.",
    amenities: ["Garden courtyard", "Laundry access", "Private parking", "Owner verified", "Quiet hours policy", "Escrow milestone alerts"]
  },
  {
    id: "surabaya-hub",
    title: "Surabaya Transit Hub",
    location: "Surabaya, Indonesia",
    distance: "Near business district",
    rating: "4.84",
    price: "Rp3.500.000",
    depositEth: "0.011",
    depositLabel: "0.011 ETH escrow deposit",
    gradient: "from-sky-200 via-cyan-100 to-slate-100",
    description:
      "Built for fast-moving professionals who need clean paperwork, visible transaction status, and quick occupancy confirmation from owners.",
    amenities: ["24/7 access", "Business lounge", "Lift access", "Digital receipts", "Admin-reviewed listing", "Owner payout tracking"]
  }
];

export const platformStats = [
  {
    label: "Verified listings",
    value: "128",
    description: "Properties ready for admin review, wallet mapping, and full-rent ETH onboarding."
  },
  {
    label: "Escrow completion rate",
    value: "98%",
    description: "Mock KPI for the dashboard and admin reports experience."
  },
  {
    label: "Avg. release time",
    value: "14h",
    description: "Owner confirmation and contract release after occupancy checks."
  },
  {
    label: "Active wallets",
    value: "341",
    description: "Tenant, owner, and admin accounts prepared for Sepolia testing."
  }
];

export const workflowSteps = [
  {
    title: "Owners upload and admins verify listings",
    description: "The flow starts with listing creation, owner identity checks, and marketplace approval before any rent payments can be accepted."
  },
  {
    title: "Tenants connect MetaMask and pay full rent",
    description: "Wallet connection happens in-browser, then the tenant sends the full monthly ETH rent defined by the property detail screen."
  },
  {
    title: "Occupancy confirmation releases funds",
    description: "After move-in confirmation, the owner finalizes occupancy and the smart contract forwards escrowed funds."
  }
];

export const dashboardPanels = [
  {
    eyebrow: "Buyer dashboard",
    title: "Tenant activity",
    badge: "Buyer",
    description: "Everything needed to browse listings, track rent payments, and keep renter progress visible in one place.",
    items: ["Marketplace shortcuts", "ETH payment status", "Notifications and reminders", "Profile summary"],
    href: "/transactions"
  },
  {
    eyebrow: "Seller dashboard",
    title: "Owner operations",
    badge: "Seller",
    description: "A clear starting point for property uploads, occupancy confirmation, and payout monitoring.",
    items: ["Upload property flow", "Manage live listings", "Incoming rent payments", "Confirm occupied"],
    href: "/marketplace"
  },
  {
    eyebrow: "Shared visibility",
    title: "Contract tools",
    badge: "Web3",
    description: "Reusable blockchain helpers stay in the shared app layer so buying can detect MetaMask directly from the property page.",
    items: ["Auto-detected MetaMask flow", "Sepolia address config", "ethers contract helper", "Transaction hash tracking"],
    href: "/transactions"
  }
];

export const transactions = [
  {
    property: "Sunrise Kebayoran Studio",
    status: "Deposit paid, waiting for occupancy confirmation",
    deposit: "0.01 ETH",
    wallet: "0x84F2...72c1",
    hash: "0x7b2e00f6a8d2f76fe6173de5ea8af9d1cd7b1a7f9b677ae5f63baab10241e927"
  },
  {
    property: "Tugu Creative Loft",
    status: "Admin verification in progress",
    deposit: "0.008 ETH",
    wallet: "0x62A0...91bd",
    hash: "0xc9578657d5fbfd8d2f8c8bc5af4adb99ec283a5fb9d1d6138fdac9cfb0ddf201"
  },
  {
    property: "Dago Garden Room",
    status: "Released to owner",
    deposit: "0.009 ETH",
    wallet: "0x3319...eF80",
    hash: "0x8fb44d0d20a9b1f7d3b5914eb7817daf7b0dcad4da5a22fa350845e3db12e4f2"
  }
];

export const adminTasks = [
  {
    eyebrow: "Verification queue",
    title: "Property approval",
    badge: "12 pending",
    description: "Review document completeness, owner wallet bindings, and listing readiness before exposing properties to tenants.",
    items: ["Validate property images", "Check owner identity", "Approve full ETH rent terms"]
  },
  {
    eyebrow: "Platform trust",
    title: "Users and disputes",
    badge: "3 flagged",
    description: "Track accounts, escalate suspicious activity, and keep a manual resolution path while on-chain rules remain simple.",
    items: ["Monitor suspicious wallets", "Resolve occupancy disputes", "Audit support escalations"]
  },
  {
    eyebrow: "Escrow visibility",
    title: "Transaction monitoring",
    badge: "Live",
    description: "A reporting hub for contract events, release timing, and incomplete confirmations that need operational attention.",
    items: ["Watch recent tx hashes", "Identify stuck confirmations", "Export operational reports"]
  },
  {
    eyebrow: "Roadmap",
    title: "Future contract features",
    badge: "Backlog",
    description: "The setup brief already points to future improvements, and this panel keeps those technical extensions visible.",
    items: ["Refund system", "Dispute smart contract", "IPFS document storage"]
  }
];
