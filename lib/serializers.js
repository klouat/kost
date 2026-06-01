import { formatEthAmount } from "@/lib/eth";

const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

export function formatProperty(row) {
  const monthlyRentEth = String(row.monthly_rent_eth ?? "0");
  const reviewStatus = getReviewStatus(row.verified);
  const ratingValue = Number(row.rating);
  const reviewCount = Number(row.review_count || 0);

  return {
    id: row.slug,
    slug: row.slug,
    title: row.title,
    location: row.location,
    distance: row.distance,
    rating: Number.isFinite(ratingValue) ? ratingValue.toFixed(2) : "0.00",
    ratingValue: Number.isFinite(ratingValue) ? ratingValue : 0,
    reviewCount,
    monthlyRentEth,
    price: `${formatEthAmount(monthlyRentEth)} ETH`,
    priceLabel: `${formatEthAmount(monthlyRentEth)} ETH / month`,
    imageUrl: row.image_url || FALLBACK_PROPERTY_IMAGE,
    imageUrls: normalizeImageUrls(row.image_urls, row.image_url),
    description: row.description,
    amenities: safeJsonParse(row.amenities, []),
    ownerUserId: row.owner_user_id || null,
    ownerName: row.owner_name || "Kos owner",
    isSaved: Boolean(Number(row.is_saved || 0)),
    verified: reviewStatus === "approved",
    reviewStatus
  };
}

export function formatTransaction(row) {
  return {
    id: row.id ? Number(row.id) : null,
    property: row.property_title,
    propertySlug: row.property_slug,
    status: row.status,
    amount: `${formatEthAmount(row.amount_eth)} ETH`,
    wallet: shortenWallet(row.wallet_address),
    hash: row.tx_hash,
    side: row.side,
    createdAt: formatDateTime(row.created_at),
    chatThreadId: row.chat_thread_id ? Number(row.chat_thread_id) : null
  };
}

export function formatAdminTask(row) {
  return {
    eyebrow: row.eyebrow,
    title: row.title,
    badge: row.badge,
    description: row.description,
    items: safeJsonParse(row.items, [])
  };
}

function shortenWallet(address) {
  if (!address || address.length < 10) {
    return address || "-";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function safeJsonParse(value, fallback) {
  if (value == null) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeImageUrls(imageUrlsValue, singleImageUrl) {
  const parsed = safeJsonParse(imageUrlsValue, []);

  if (Array.isArray(parsed) && parsed.length) {
    return parsed;
  }

  if (singleImageUrl) {
    return [singleImageUrl];
  }

  return [FALLBACK_PROPERTY_IMAGE];
}

function getReviewStatus(value) {
  const normalizedValue = Number(value);

  if (normalizedValue === 1) {
    return "approved";
  }

  if (normalizedValue === -1) {
    return "rejected";
  }

  return "pending";
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}
