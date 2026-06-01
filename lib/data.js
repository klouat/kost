import { execute, query, queryOne } from "@/lib/db";
import { formatAdminTask, formatProperty, formatTransaction } from "@/lib/serializers";

const PROPERTY_SELECT_FIELDS = `
  p.slug,
  p.title,
  p.location,
  p.distance,
  COALESCE(rv.average_rating, p.rating) AS rating,
  COALESCE(rv.review_count, 0) AS review_count,
  p.monthly_rent_eth,
  p.image_url,
  p.image_urls,
  p.description,
  p.amenities,
  p.owner_user_id,
  p.verified,
  u.name AS owner_name,
  COALESCE(sp.is_saved, 0) AS is_saved
`;

const PROPERTY_REVIEW_JOIN = `
  LEFT JOIN users u ON u.id = p.owner_user_id
  LEFT JOIN (
    SELECT
      property_id,
      AVG(rating) AS average_rating,
      COUNT(*) AS review_count
    FROM property_reviews
    GROUP BY property_id
  ) rv ON rv.property_id = p.id
`;

function buildSavedPropertyJoin(userId) {
  if (!userId) {
    return "LEFT JOIN (SELECT 0 AS is_saved, NULL AS property_id) sp ON sp.property_id = p.id";
  }

  return `
    LEFT JOIN (
      SELECT
        property_id,
        1 AS is_saved
      FROM saved_properties
      WHERE user_id = ${Number(userId)}
    ) sp ON sp.property_id = p.id
  `;
}

export async function getFeaturedProperties(userId = null) {
  const rows = await query(
    `
      SELECT
        ${PROPERTY_SELECT_FIELDS}
      FROM properties p
      ${PROPERTY_REVIEW_JOIN}
      ${buildSavedPropertyJoin(userId)}
      WHERE p.featured = 1
        AND p.verified = 1
      ORDER BY p.sort_order ASC, p.created_at DESC
    `
  );

  return rows.map(formatProperty);
}

export async function getAllProperties(search = "", userId = null) {
  const trimmedSearch = search.trim();
  const rows = await query(
    `
      SELECT
        ${PROPERTY_SELECT_FIELDS}
      FROM properties p
      ${PROPERTY_REVIEW_JOIN}
      ${buildSavedPropertyJoin(userId)}
      WHERE p.verified = 1
        AND (
          ? = ''
          OR p.title LIKE CONCAT('%', ?, '%')
          OR p.location LIKE CONCAT('%', ?, '%')
          OR p.distance LIKE CONCAT('%', ?, '%')
          OR p.description LIKE CONCAT('%', ?, '%')
        )
      ORDER BY p.featured DESC, p.sort_order ASC, p.created_at DESC
    `,
    [trimmedSearch, trimmedSearch, trimmedSearch, trimmedSearch, trimmedSearch]
  );

  return rows.map(formatProperty);
}

export async function getPropertyBySlug(slug, userId = null) {
  const row = await queryOne(
    `
      SELECT
        ${PROPERTY_SELECT_FIELDS}
      FROM properties p
      ${PROPERTY_REVIEW_JOIN}
      ${buildSavedPropertyJoin(userId)}
      WHERE p.slug = ?
      LIMIT 1
    `,
    [slug]
  );

  return row ? formatProperty(row) : null;
}

export async function getUserListings(userId) {
  const rows = await query(
    `
      SELECT
        ${PROPERTY_SELECT_FIELDS}
      FROM properties p
      ${PROPERTY_REVIEW_JOIN}
      ${buildSavedPropertyJoin(userId)}
      WHERE p.owner_user_id = ?
      ORDER BY p.created_at DESC
    `,
    [userId]
  );

  return rows.map(formatProperty);
}

export async function getPendingListings() {
  const rows = await query(
    `
      SELECT
        ${PROPERTY_SELECT_FIELDS}
      FROM properties p
      ${PROPERTY_REVIEW_JOIN}
      ${buildSavedPropertyJoin(null)}
      WHERE p.verified = 0
      ORDER BY p.created_at ASC
    `
  );

  return rows.map(formatProperty);
}

export async function getUserTransactions(userId) {
  const rows = await query(
    `
      SELECT
        t.id AS id,
        t.status,
        t.amount_eth,
        t.wallet_address,
        t.tx_hash,
        t.created_at,
        p.slug AS property_slug,
        p.title AS property_title,
        thread.id AS chat_thread_id,
        CASE
          WHEN t.tenant_user_id = ? THEN 'Renter'
          ELSE 'Owner'
        END AS side
      FROM transactions t
      INNER JOIN properties p ON p.id = t.property_id
      LEFT JOIN chat_threads thread ON thread.transaction_id = t.id
      WHERE t.tenant_user_id = ?
         OR p.owner_user_id = ?
      ORDER BY t.created_at DESC
    `,
    [userId, userId, userId]
  );

  return rows.map(formatTransaction);
}

export async function getUserTransactionForProperty(userId, propertySlug) {
  const row = await queryOne(
    `
      SELECT
        t.id AS id,
        t.status,
        t.amount_eth,
        t.wallet_address,
        t.tx_hash,
        t.created_at,
        p.slug AS property_slug,
        p.title AS property_title,
        thread.id AS chat_thread_id,
        'Renter' AS side
      FROM transactions t
      INNER JOIN properties p ON p.id = t.property_id
      LEFT JOIN chat_threads thread ON thread.transaction_id = t.id
      WHERE t.tenant_user_id = ?
        AND p.slug = ?
      ORDER BY t.created_at DESC
      LIMIT 1
    `,
    [userId, propertySlug]
  );

  return row ? formatTransaction(row) : null;
}

export async function toggleSavedProperty(userId, propertySlug) {
  const property = await queryOne(
    `
      SELECT id
      FROM properties
      WHERE slug = ?
      LIMIT 1
    `,
    [propertySlug]
  );

  if (!property) {
    throw new Error("Property not found.");
  }

  const existingSavedProperty = await queryOne(
    `
      SELECT id
      FROM saved_properties
      WHERE user_id = ?
        AND property_id = ?
      LIMIT 1
    `,
    [userId, property.id]
  );

  if (existingSavedProperty) {
    await execute(
      `
        DELETE FROM saved_properties
        WHERE id = ?
      `,
      [existingSavedProperty.id]
    );

    return { isSaved: false };
  }

  await execute(
    `
      INSERT INTO saved_properties (user_id, property_id)
      VALUES (?, ?)
    `,
    [userId, property.id]
  );

  return { isSaved: true };
}

export async function getSavedPropertiesForUser(userId) {
  const rows = await query(
    `
      SELECT
        ${PROPERTY_SELECT_FIELDS}
      FROM saved_properties saved
      INNER JOIN properties p ON p.id = saved.property_id
      ${PROPERTY_REVIEW_JOIN}
      ${buildSavedPropertyJoin(userId)}
      WHERE saved.user_id = ?
        AND p.verified = 1
      ORDER BY saved.created_at DESC
    `,
    [userId]
  );

  return rows.map(formatProperty);
}

export async function getPropertyReviews(propertySlug) {
  const rows = await query(
    `
      SELECT
        pr.rating,
        pr.comment,
        pr.created_at,
        u.name AS reviewer_name,
        u.profile_image_url AS reviewer_image_url
      FROM property_reviews pr
      INNER JOIN properties p ON p.id = pr.property_id
      INNER JOIN users u ON u.id = pr.user_id
      WHERE p.slug = ?
      ORDER BY pr.created_at DESC
    `,
    [propertySlug]
  );

  return rows.map((row) => ({
    rating: Number(row.rating),
    comment: row.comment,
    reviewerName: row.reviewer_name || "Guest",
    reviewerImageUrl: row.reviewer_image_url || "",
    createdAtLabel: formatDateLabel(row.created_at)
  }));
}

export async function getUserReviewForProperty(userId, propertySlug) {
  return queryOne(
    `
      SELECT
        pr.rating,
        pr.comment
      FROM property_reviews pr
      INNER JOIN properties p ON p.id = pr.property_id
      WHERE pr.user_id = ?
        AND p.slug = ?
      LIMIT 1
    `,
    [userId, propertySlug]
  );
}

export async function canUserReviewProperty(userId, propertySlug) {
  const transaction = await queryOne(
    `
      SELECT t.id
      FROM transactions t
      INNER JOIN properties p ON p.id = t.property_id
      WHERE t.tenant_user_id = ?
        AND p.slug = ?
      LIMIT 1
    `,
    [userId, propertySlug]
  );

  return Boolean(transaction);
}

export async function upsertPropertyReview({ userId, propertySlug, rating, comment }) {
  const property = await queryOne(
    `
      SELECT id, owner_user_id
      FROM properties
      WHERE slug = ?
      LIMIT 1
    `,
    [propertySlug]
  );

  if (!property) {
    throw new Error("Property not found.");
  }

  if (Number(property.owner_user_id) === Number(userId)) {
    throw new Error("Owners cannot review their own listing.");
  }

  const eligibleToReview = await canUserReviewProperty(userId, propertySlug);

  if (!eligibleToReview) {
    throw new Error("Only renters with a transaction for this kost can leave a review.");
  }

  await execute(
    `
      INSERT INTO property_reviews (
        property_id,
        user_id,
        rating,
        comment
      )
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        comment = VALUES(comment),
        updated_at = CURRENT_TIMESTAMP
    `,
    [property.id, userId, rating, comment]
  );
}

export async function getAdminTransactions(filters = {}) {
  const normalizedStatus = typeof filters.status === "string" ? filters.status.trim() : "";
  const normalizedQuery = typeof filters.query === "string" ? filters.query.trim() : "";

  const rows = await query(
    `
      SELECT
        t.id AS id,
        t.status,
        t.amount_eth,
        t.wallet_address,
        t.tx_hash,
        t.created_at,
        p.slug AS property_slug,
        p.title AS property_title,
        renter.name AS tenant_name,
        owner.name AS owner_name,
        CASE
          WHEN LOWER(t.status) LIKE '%complete%' OR LOWER(t.status) LIKE '%released%' THEN 'completed'
          WHEN LOWER(t.status) LIKE '%pending%'
            OR LOWER(t.status) LIKE '%awaiting%'
            OR LOWER(t.status) LIKE '%confirm%'
            OR LOWER(t.status) LIKE '%buyer has paid%'
          THEN 'pending'
          ELSE 'review'
        END AS operational_status
      FROM transactions t
      INNER JOIN properties p ON p.id = t.property_id
      LEFT JOIN users renter ON renter.id = t.tenant_user_id
      LEFT JOIN users owner ON owner.id = p.owner_user_id
      WHERE (
        ? = ''
        OR (
          CASE
            WHEN LOWER(t.status) LIKE '%complete%' OR LOWER(t.status) LIKE '%released%' THEN 'completed'
            WHEN LOWER(t.status) LIKE '%pending%'
              OR LOWER(t.status) LIKE '%awaiting%'
              OR LOWER(t.status) LIKE '%confirm%'
              OR LOWER(t.status) LIKE '%buyer has paid%'
            THEN 'pending'
            ELSE 'review'
          END
        ) = ?
      )
        AND (
          ? = ''
          OR p.title LIKE CONCAT('%', ?, '%')
          OR t.tx_hash LIKE CONCAT('%', ?, '%')
          OR t.wallet_address LIKE CONCAT('%', ?, '%')
          OR renter.name LIKE CONCAT('%', ?, '%')
          OR owner.name LIKE CONCAT('%', ?, '%')
        )
      ORDER BY t.created_at DESC
    `,
    [
      normalizedStatus,
      normalizedStatus,
      normalizedQuery,
      normalizedQuery,
      normalizedQuery,
      normalizedQuery,
      normalizedQuery,
      normalizedQuery
    ]
  );

  const transactions = rows.map((row) => ({
    ...formatTransaction(row),
    propertySlug: row.property_slug,
    tenantName: row.tenant_name || "Unknown renter",
    ownerName: row.owner_name || "Unknown owner",
    operationalStatus: row.operational_status
  }));

  return {
    transactions,
    summary: {
      totalCount: transactions.length,
      pendingCount: transactions.filter((transaction) => transaction.operationalStatus === "pending").length,
      reviewCount: transactions.filter((transaction) => transaction.operationalStatus === "review").length,
      completedCount: transactions.filter((transaction) => transaction.operationalStatus === "completed").length
    }
  };
}

export async function updateTransactionStatus(transactionId, status) {
  await execute(
    `
      UPDATE transactions
      SET status = ?
      WHERE id = ?
    `,
    [status, transactionId]
  );
}

export async function getAdminTasks() {
  const rows = await query(
    `
      SELECT eyebrow, title, badge, description, items
      FROM admin_tasks
      ORDER BY sort_order ASC, id ASC
    `
  );

  return rows.map(formatAdminTask);
}

export async function getUserDashboardData(userId) {
  const [summary] = await query(
    `
      SELECT
        (SELECT COUNT(*) FROM properties WHERE owner_user_id = ?) AS listing_count,
        (SELECT COUNT(*) FROM properties WHERE owner_user_id = ? AND verified = 0) AS pending_listing_count,
        (SELECT COUNT(*) FROM transactions WHERE tenant_user_id = ?) AS renter_transaction_count,
        (
          SELECT COUNT(*)
          FROM transactions t
          INNER JOIN properties p ON p.id = t.property_id
          WHERE p.owner_user_id = ?
        ) AS owner_transaction_count
    `,
    [userId, userId, userId, userId]
  );

  const listings = await getUserListings(userId);
  const transactions = await getUserTransactions(userId);

  return {
    summary,
    listings,
    transactions
  };
}

export async function getAdminOverview() {
  const [summary] = await query(
    `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role IN ('buyer', 'seller')) AS regular_user_count,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') AS admin_user_count,
        (SELECT COUNT(*) FROM properties) AS property_count,
        (SELECT COUNT(*) FROM properties WHERE verified = 0) AS pending_property_count,
        (SELECT COUNT(*) FROM transactions) AS transaction_count
    `
  );

  const recentUsers = await query(
    `
      SELECT id, name, email, role, profile_image_url
      FROM users
      ORDER BY created_at DESC
      LIMIT 6
    `
  );

  const recentListings = await query(
    `
      SELECT p.slug, p.title, p.location, p.verified, u.name AS owner_name
      FROM properties p
      LEFT JOIN users u ON u.id = p.owner_user_id
      ORDER BY p.created_at DESC
      LIMIT 6
    `
  );

  const pendingListings = await getPendingListings();

  return {
    summary,
    recentUsers,
    recentListings: recentListings.map((listing) => ({
      ...listing,
      reviewStatus: getReviewStatusFromFlag(listing.verified)
    })),
    pendingListings
  };
}

export async function createPropertyForUser(userId, values) {
  const slug = createSlug(values.title);
  const uniqueSlug = await ensureUniqueSlug(slug);

  await execute(
    `
      INSERT INTO properties (
        slug,
        owner_user_id,
        title,
        location,
        distance,
        rating,
        monthly_rent_eth,
        image_url,
        image_urls,
        gradient,
        description,
        amenities,
        verified,
        featured,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, 5.00, ?, ?, ?, '', ?, ?, 0, 0, 999)
    `,
    [
      uniqueSlug,
      userId,
      values.title.trim(),
      values.location.trim(),
      values.distance.trim(),
      values.monthlyRentEth,
      values.imageUrl.trim(),
      JSON.stringify(values.imageUrls),
      values.description.trim(),
      JSON.stringify(values.amenities)
    ]
  );

  return uniqueSlug;
}

export async function approvePropertyBySlug(slug) {
  await execute(
    `
      UPDATE properties
      SET verified = 1
      WHERE slug = ?
        AND verified = 0
    `,
    [slug]
  );
}

export async function denyPropertyBySlug(slug) {
  await execute(
    `
      UPDATE properties
      SET verified = -1
      WHERE slug = ?
        AND verified = 0
    `,
    [slug]
  );
}

export async function updateUserProfile(userId, values) {
  await execute(
    `
      UPDATE users
      SET
        name = ?,
        profile_image_url = ?
      WHERE id = ?
    `,
    [values.name.trim(), values.profileImageUrl.trim(), userId]
  );
}

export async function createTransactionRecord({ propertySlug, tenantUserId, status, amountEth, walletAddress, txHash }) {
  const property = await queryOne(
    `
      SELECT id, owner_user_id
      FROM properties
      WHERE slug = ?
      LIMIT 1
    `,
    [propertySlug]
  );

  if (!property) {
    throw new Error("Property not found.");
  }

  await execute(
    `
      INSERT INTO transactions (
        property_id,
        tenant_user_id,
        status,
        amount_eth,
        wallet_address,
        tx_hash
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tenant_user_id = VALUES(tenant_user_id),
        status = VALUES(status),
        amount_eth = VALUES(amount_eth),
        wallet_address = VALUES(wallet_address)
    `,
    [
      property.id,
      tenantUserId,
      status,
      amountEth,
      walletAddress,
      txHash
    ]
  );

  const transaction = await queryOne(
    `
      SELECT id
      FROM transactions
      WHERE tx_hash = ?
      LIMIT 1
    `,
    [txHash]
  );

  const chatThreadId = transaction?.id ? await ensureChatThreadForTransaction(transaction.id) : null;

  return {
    transactionId: transaction?.id || null,
    chatThreadId
  };
}

export async function getUserChatThreads(userId) {
  const rows = await query(
    `
      SELECT
        ct.id,
        ct.transaction_id,
        p.slug AS property_slug,
        p.title AS property_title,
        t.tx_hash,
        t.created_at AS transaction_created_at,
        CASE
          WHEN ct.buyer_user_id = ? THEN seller.id
          ELSE buyer.id
        END AS counterparty_id,
        CASE
          WHEN ct.buyer_user_id = ? THEN seller.name
          ELSE buyer.name
        END AS counterparty_name,
        CASE
          WHEN ct.buyer_user_id = ? THEN seller.role
          ELSE buyer.role
        END AS counterparty_role,
        CASE
          WHEN ct.buyer_user_id = ? THEN seller.profile_image_url
          ELSE buyer.profile_image_url
        END AS counterparty_image_url,
        last_message.body AS last_message_body,
        last_message.created_at AS last_message_at
      FROM chat_threads ct
      INNER JOIN transactions t ON t.id = ct.transaction_id
      INNER JOIN properties p ON p.id = ct.property_id
      INNER JOIN users buyer ON buyer.id = ct.buyer_user_id
      INNER JOIN users seller ON seller.id = ct.seller_user_id
      LEFT JOIN chat_messages last_message ON last_message.id = (
        SELECT cm.id
        FROM chat_messages cm
        WHERE cm.thread_id = ct.id
        ORDER BY cm.created_at DESC, cm.id DESC
        LIMIT 1
      )
      WHERE ct.buyer_user_id = ?
         OR ct.seller_user_id = ?
      ORDER BY COALESCE(last_message.created_at, t.created_at) DESC, ct.id DESC
    `,
    [userId, userId, userId, userId, userId, userId]
  );

  return rows.map(formatChatThreadSummary);
}

export async function getChatThreadByIdForUser(userId, threadId) {
  const row = await queryOne(
    `
      SELECT
        ct.id,
        ct.transaction_id,
        p.slug AS property_slug,
        p.title AS property_title,
        t.tx_hash,
        t.created_at AS transaction_created_at,
        CASE
          WHEN ct.buyer_user_id = ? THEN seller.id
          ELSE buyer.id
        END AS counterparty_id,
        CASE
          WHEN ct.buyer_user_id = ? THEN seller.name
          ELSE buyer.name
        END AS counterparty_name,
        CASE
          WHEN ct.buyer_user_id = ? THEN seller.role
          ELSE buyer.role
        END AS counterparty_role,
        CASE
          WHEN ct.buyer_user_id = ? THEN seller.profile_image_url
          ELSE buyer.profile_image_url
        END AS counterparty_image_url,
        last_message.body AS last_message_body,
        last_message.created_at AS last_message_at
      FROM chat_threads ct
      INNER JOIN transactions t ON t.id = ct.transaction_id
      INNER JOIN properties p ON p.id = ct.property_id
      INNER JOIN users buyer ON buyer.id = ct.buyer_user_id
      INNER JOIN users seller ON seller.id = ct.seller_user_id
      LEFT JOIN chat_messages last_message ON last_message.id = (
        SELECT cm.id
        FROM chat_messages cm
        WHERE cm.thread_id = ct.id
        ORDER BY cm.created_at DESC, cm.id DESC
        LIMIT 1
      )
      WHERE ct.id = ?
        AND (ct.buyer_user_id = ? OR ct.seller_user_id = ?)
      LIMIT 1
    `,
    [userId, userId, userId, userId, threadId, userId, userId]
  );

  return row ? formatChatThreadSummary(row) : null;
}

export async function getChatMessagesForThread(userId, threadId) {
  const thread = await getChatThreadByIdForUser(userId, threadId);

  if (!thread) {
    throw new Error("Chat thread not found.");
  }

  const rows = await query(
    `
      SELECT
        cm.id,
        cm.body,
        cm.created_at,
        cm.sender_user_id,
        sender.name AS sender_name
      FROM chat_messages cm
      INNER JOIN users sender ON sender.id = cm.sender_user_id
      WHERE cm.thread_id = ?
      ORDER BY cm.created_at ASC, cm.id ASC
    `,
    [threadId]
  );

  return {
    thread,
    messages: rows.map((row) => ({
      id: Number(row.id),
      body: row.body,
      senderUserId: Number(row.sender_user_id),
      senderName: row.sender_name || "Unknown user",
      sentAt: formatDateTime(row.created_at),
      isMine: Number(row.sender_user_id) === Number(userId)
    }))
  };
}

export async function createChatMessage({ threadId, senderUserId, body }) {
  const normalizedBody = String(body || "").trim();

  if (!normalizedBody) {
    throw new Error("Message cannot be empty.");
  }

  if (normalizedBody.length > 2000) {
    throw new Error("Message is too long.");
  }

  const thread = await getChatThreadByIdForUser(senderUserId, threadId);

  if (!thread) {
    throw new Error("Chat thread not found.");
  }

  await execute(
    `
      INSERT INTO chat_messages (
        thread_id,
        sender_user_id,
        body
      )
      VALUES (?, ?, ?)
    `,
    [threadId, senderUserId, normalizedBody]
  );

  await execute(
    `
      UPDATE chat_threads
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [threadId]
  );

  return getChatMessagesForThread(senderUserId, threadId);
}

async function ensureChatThreadForTransaction(transactionId) {
  const transaction = await queryOne(
    `
      SELECT
        t.id,
        t.property_id,
        t.tenant_user_id,
        p.owner_user_id
      FROM transactions t
      INNER JOIN properties p ON p.id = t.property_id
      WHERE t.id = ?
      LIMIT 1
    `,
    [transactionId]
  );

  if (!transaction?.tenant_user_id || !transaction?.owner_user_id) {
    return null;
  }

  await execute(
    `
      INSERT INTO chat_threads (
        transaction_id,
        property_id,
        buyer_user_id,
        seller_user_id
      )
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        property_id = VALUES(property_id),
        buyer_user_id = VALUES(buyer_user_id),
        seller_user_id = VALUES(seller_user_id)
    `,
    [transaction.id, transaction.property_id, transaction.tenant_user_id, transaction.owner_user_id]
  );

  const thread = await queryOne(
    `
      SELECT id
      FROM chat_threads
      WHERE transaction_id = ?
      LIMIT 1
    `,
    [transactionId]
  );

  return thread?.id ? Number(thread.id) : null;
}

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

async function ensureUniqueSlug(baseSlug) {
  const safeBaseSlug = baseSlug || "kost-listing";
  let candidate = safeBaseSlug;
  let counter = 1;

  while (await queryOne("SELECT slug FROM properties WHERE slug = ? LIMIT 1", [candidate])) {
    counter += 1;
    candidate = `${safeBaseSlug}-${counter}`;
  }

  return candidate;
}

function getReviewStatusFromFlag(value) {
  const normalizedValue = Number(value);

  if (normalizedValue === 1) {
    return "approved";
  }

  if (normalizedValue === -1) {
    return "rejected";
  }

  return "pending";
}

function formatDateLabel(value) {
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
    day: "numeric"
  }).format(date);
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
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatChatThreadSummary(row) {
  return {
    id: Number(row.id),
    transactionId: Number(row.transaction_id),
    propertySlug: row.property_slug,
    propertyTitle: row.property_title,
    transactionHash: row.tx_hash,
    counterpartyId: row.counterparty_id ? Number(row.counterparty_id) : null,
    counterpartyName: row.counterparty_name || "Unknown user",
    counterpartyRole: row.counterparty_role || "user",
    counterpartyImageUrl: row.counterparty_image_url || "",
    lastMessagePreview: row.last_message_body || "No messages yet. Start the conversation here.",
    lastMessageAt: formatDateTime(row.last_message_at || row.transaction_created_at)
  };
}
