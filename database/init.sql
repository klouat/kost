CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role ENUM('buyer', 'seller', 'admin') NOT NULL DEFAULT 'buyer',
  profile_image_url VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

SET @users_role_expand_sql = 'ALTER TABLE users MODIFY COLUMN role ENUM(''buyer'', ''seller'', ''admin'', ''user'') NOT NULL DEFAULT ''buyer''';
PREPARE users_role_expand_stmt FROM @users_role_expand_sql;
EXECUTE users_role_expand_stmt;
DEALLOCATE PREPARE users_role_expand_stmt;

UPDATE users SET role = 'buyer' WHERE role = 'user';
UPDATE users SET role = 'seller' WHERE email = 'seller@kosescrow.local';
UPDATE users SET role = 'buyer' WHERE email = 'buyer@kosescrow.local';
UPDATE users SET role = 'admin' WHERE email = 'admin@kosescrow.local';

SET @users_role_finalize_sql = 'ALTER TABLE users MODIFY COLUMN role ENUM(''buyer'', ''seller'', ''admin'') NOT NULL DEFAULT ''buyer''';
PREPARE users_role_finalize_stmt FROM @users_role_finalize_sql;
EXECUTE users_role_finalize_stmt;
DEALLOCATE PREPARE users_role_finalize_stmt;

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sessions_token_hash (token_hash),
  KEY idx_sessions_user_id (user_id),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS properties (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id INT UNSIGNED NULL,
  slug VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  distance VARCHAR(255) NOT NULL,
  rating DECIMAL(3,2) NOT NULL,
  monthly_rent_eth DECIMAL(36,18) NOT NULL DEFAULT 0.005,
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  image_urls JSON NULL,
  gradient VARCHAR(120) NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  amenities JSON NOT NULL,
  verified TINYINT(1) NOT NULL DEFAULT 1,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_properties_slug (slug),
  KEY idx_properties_featured (featured, sort_order),
  KEY idx_properties_verified (verified, sort_order),
  KEY idx_properties_owner_user_id (owner_user_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  property_id INT UNSIGNED NOT NULL,
  tenant_user_id INT UNSIGNED NULL,
  status VARCHAR(255) NOT NULL,
  amount_eth DECIMAL(36,18) NOT NULL DEFAULT 0.000000000000000000,
  wallet_address VARCHAR(128) NOT NULL,
  tx_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_transactions_tx_hash (tx_hash),
  KEY idx_transactions_property (property_id, created_at),
  KEY idx_transactions_tenant_user_id (tenant_user_id),
  CONSTRAINT fk_transactions_property
    FOREIGN KEY (property_id) REFERENCES properties (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS property_reviews (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  property_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_property_reviews_property_user (property_id, user_id),
  KEY idx_property_reviews_property_created (property_id, created_at),
  KEY idx_property_reviews_user_id (user_id),
  CONSTRAINT fk_property_reviews_property
    FOREIGN KEY (property_id) REFERENCES properties (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_property_reviews_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT chk_property_reviews_rating
    CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS chat_threads (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  transaction_id INT UNSIGNED NOT NULL,
  property_id INT UNSIGNED NOT NULL,
  buyer_user_id INT UNSIGNED NOT NULL,
  seller_user_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_chat_threads_transaction (transaction_id),
  KEY idx_chat_threads_buyer (buyer_user_id, updated_at),
  KEY idx_chat_threads_seller (seller_user_id, updated_at),
  CONSTRAINT fk_chat_threads_transaction
    FOREIGN KEY (transaction_id) REFERENCES transactions (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_chat_threads_property
    FOREIGN KEY (property_id) REFERENCES properties (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_chat_threads_buyer
    FOREIGN KEY (buyer_user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_chat_threads_seller
    FOREIGN KEY (seller_user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  thread_id INT UNSIGNED NOT NULL,
  sender_user_id INT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_chat_messages_thread_created (thread_id, created_at),
  KEY idx_chat_messages_sender (sender_user_id),
  CONSTRAINT fk_chat_messages_thread
    FOREIGN KEY (thread_id) REFERENCES chat_threads (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_chat_messages_sender
    FOREIGN KEY (sender_user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_properties (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  property_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_saved_properties_user_property (user_id, property_id),
  KEY idx_saved_properties_user_created (user_id, created_at),
  KEY idx_saved_properties_property (property_id),
  CONSTRAINT fk_saved_properties_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_saved_properties_property
    FOREIGN KEY (property_id) REFERENCES properties (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_tasks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  eyebrow VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  badge VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  items JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_tasks_title (title)
);

SET @properties_owner_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'properties'
    AND column_name = 'owner_user_id'
);
SET @properties_owner_sql = IF(
  @properties_owner_exists = 0,
  'ALTER TABLE properties ADD COLUMN owner_user_id INT UNSIGNED NULL AFTER id',
  'SELECT 1'
);
PREPARE properties_owner_stmt FROM @properties_owner_sql;
EXECUTE properties_owner_stmt;
DEALLOCATE PREPARE properties_owner_stmt;

SET @properties_image_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'properties'
    AND column_name = 'image_url'
);
SET @properties_image_sql = IF(
  @properties_image_exists = 0,
  'ALTER TABLE properties ADD COLUMN image_url VARCHAR(500) NOT NULL DEFAULT '''' AFTER monthly_rent_eth',
  'SELECT 1'
);
PREPARE properties_image_stmt FROM @properties_image_sql;
EXECUTE properties_image_stmt;
DEALLOCATE PREPARE properties_image_stmt;

SET @properties_image_urls_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'properties'
    AND column_name = 'image_urls'
);
SET @properties_image_urls_sql = IF(
  @properties_image_urls_exists = 0,
  'ALTER TABLE properties ADD COLUMN image_urls JSON NULL AFTER image_url',
  'SELECT 1'
);
PREPARE properties_image_urls_stmt FROM @properties_image_urls_sql;
EXECUTE properties_image_urls_stmt;
DEALLOCATE PREPARE properties_image_urls_stmt;

SET @properties_rent_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'properties'
    AND column_name = 'monthly_rent_eth'
);
SET @properties_rent_sql = IF(
  @properties_rent_exists = 0,
  'ALTER TABLE properties ADD COLUMN monthly_rent_eth DECIMAL(36,18) NOT NULL DEFAULT 0.005 AFTER rating',
  'SELECT 1'
);
PREPARE properties_rent_stmt FROM @properties_rent_sql;
EXECUTE properties_rent_stmt;
DEALLOCATE PREPARE properties_rent_stmt;

SET @properties_monthly_price_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'properties'
    AND column_name = 'monthly_price'
);
SET @properties_monthly_price_drop_sql = IF(
  @properties_monthly_price_exists = 1,
  'ALTER TABLE properties DROP COLUMN monthly_price',
  'SELECT 1'
);
PREPARE properties_monthly_price_drop_stmt FROM @properties_monthly_price_drop_sql;
EXECUTE properties_monthly_price_drop_stmt;
DEALLOCATE PREPARE properties_monthly_price_drop_stmt;

SET @transactions_tenant_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'transactions'
    AND column_name = 'tenant_user_id'
);
SET @transactions_tenant_sql = IF(
  @transactions_tenant_exists = 0,
  'ALTER TABLE transactions ADD COLUMN tenant_user_id INT UNSIGNED NULL AFTER property_id',
  'SELECT 1'
);
PREPARE transactions_tenant_stmt FROM @transactions_tenant_sql;
EXECUTE transactions_tenant_stmt;
DEALLOCATE PREPARE transactions_tenant_stmt;

SET @transactions_amount_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'transactions'
    AND column_name = 'amount_eth'
);
SET @transactions_amount_sql = IF(
  @transactions_amount_exists = 0,
  'ALTER TABLE transactions ADD COLUMN amount_eth DECIMAL(36,18) NOT NULL DEFAULT 0.000000000000000000 AFTER status',
  'SELECT 1'
);
PREPARE transactions_amount_stmt FROM @transactions_amount_sql;
EXECUTE transactions_amount_stmt;
DEALLOCATE PREPARE transactions_amount_stmt;

SET @properties_deposit_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'properties'
    AND column_name = 'deposit_eth'
);
SET @properties_deposit_drop_sql = IF(
  @properties_deposit_exists = 1,
  'ALTER TABLE properties DROP COLUMN deposit_eth',
  'SELECT 1'
);
PREPARE properties_deposit_drop_stmt FROM @properties_deposit_drop_sql;
EXECUTE properties_deposit_drop_stmt;
DEALLOCATE PREPARE properties_deposit_drop_stmt;

SET @transactions_deposit_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'transactions'
    AND column_name = 'deposit_eth'
);
SET @transactions_deposit_drop_sql = IF(
  @transactions_deposit_exists = 1,
  'ALTER TABLE transactions DROP COLUMN deposit_eth',
  'SELECT 1'
);
PREPARE transactions_deposit_drop_stmt FROM @transactions_deposit_drop_sql;
EXECUTE transactions_deposit_drop_stmt;
DEALLOCATE PREPARE transactions_deposit_drop_stmt;

ALTER TABLE properties
MODIFY COLUMN monthly_rent_eth DECIMAL(36,18) NOT NULL DEFAULT 0.005;

ALTER TABLE transactions
MODIFY COLUMN amount_eth DECIMAL(36,18) NOT NULL DEFAULT 0.000000000000000000;

SET @users_wallet_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'wallet_address'
);
SET @users_wallet_drop_sql = IF(
  @users_wallet_exists = 1,
  'ALTER TABLE users DROP COLUMN wallet_address',
  'SELECT 1'
);
PREPARE users_wallet_drop_stmt FROM @users_wallet_drop_sql;
EXECUTE users_wallet_drop_stmt;
DEALLOCATE PREPARE users_wallet_drop_stmt;

UPDATE properties
SET image_urls = JSON_ARRAY(image_url)
WHERE image_url <> ''
  AND (image_urls IS NULL OR JSON_LENGTH(image_urls) = 0);

INSERT INTO users (name, email, password_hash, role, profile_image_url)
VALUES
  (
    'Buyer Demo',
    'buyer@kosescrow.local',
    '7b622b292c225decc4fbe0ac7b0ab386:a4f6dd38d5307e4c85f7c95968ba01983400209b9faa9f9c0e6453099d20bcd4266b5255d52622d1350a7532ce980a9f794a6ba0100d978020876822f9fdfc9d',
    'buyer',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'Seller Demo',
    'seller@kosescrow.local',
    'f35608ac47b2ee8a771c38d4b07b4e92:a6005926f67c23f529ed88d6228c2f83126e6d97739fc0929452e7a2c32ad723584fede610a2857614065ea18efc80a944ec7398c9163cb772a2b9f501de8d84',
    'seller',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'Admin Demo',
    'admin@kosescrow.local',
    'aa7fc51f359ff082dfe85b4cf9883d06:705e6dda1f8a1244876127ea472851904279aac8b5bacca608826052857cda543e586af1867d7851a5daa1164c16de5f382af4fd8b9f62ca9bec9d22d112c17a',
    'admin',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'Campus Renter',
    'campus@kosescrow.local',
    '7b622b292c225decc4fbe0ac7b0ab386:a4f6dd38d5307e4c85f7c95968ba01983400209b9faa9f9c0e6453099d20bcd4266b5255d52622d1350a7532ce980a9f794a6ba0100d978020876822f9fdfc9d',
    'buyer',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'Remote Worker',
    'remote@kosescrow.local',
    '7b622b292c225decc4fbe0ac7b0ab386:a4f6dd38d5307e4c85f7c95968ba01983400209b9faa9f9c0e6453099d20bcd4266b5255d52622d1350a7532ce980a9f794a6ba0100d978020876822f9fdfc9d',
    'buyer',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'Transit Tenant',
    'transit@kosescrow.local',
    '7b622b292c225decc4fbe0ac7b0ab386:a4f6dd38d5307e4c85f7c95968ba01983400209b9faa9f9c0e6453099d20bcd4266b5255d52622d1350a7532ce980a9f794a6ba0100d978020876822f9fdfc9d',
    'buyer',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  profile_image_url = VALUES(profile_image_url);

INSERT INTO properties (
  owner_user_id,
  slug,
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
VALUES
  (
    (SELECT id FROM users WHERE email = 'seller@kosescrow.local' LIMIT 1),
    'sunrise-kebayoran',
    'Sunrise Kebayoran Studio',
    'South Jakarta, Indonesia',
    '12 minutes to MRT',
    4.91,
    0.005,
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ),
    '',
    'A polished studio for city renters who want predictable move-in protection, responsive owners, and a clear monthly ETH rent flow.',
    JSON_ARRAY('Private bathroom', 'Wi-Fi included', 'Access card lobby', 'Verified owner', 'Monthly cleaning', 'Sepolia demo ready'),
    1,
    1,
    1
  ),
  (
    (SELECT id FROM users WHERE email = 'seller@kosescrow.local' LIMIT 1),
    'tugu-loft',
    'Tugu Creative Loft',
    'Yogyakarta, Indonesia',
    '8 minutes to campus',
    4.88,
    0.005,
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
    ),
    '',
    'Designed for students and indie workers who want a warmer, flexible kos setup with clear owner obligations before full monthly rent is released.',
    JSON_ARRAY('Desk setup', 'Shared kitchen', 'Fast internet', 'CCTV access', 'Verified documents', 'Move-in checklist'),
    1,
    1,
    2
  ),
  (
    (SELECT id FROM users WHERE email = 'seller@kosescrow.local' LIMIT 1),
    'dago-garden',
    'Dago Garden Room',
    'Bandung, Indonesia',
    '15 minutes to ITB',
    4.95,
    0.005,
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ),
    '',
    'A calmer hillside property with reliable landlords, verified compliance, and a transaction trail that both tenant and owner can audit.',
    JSON_ARRAY('Garden courtyard', 'Laundry access', 'Private parking', 'Owner verified', 'Quiet hours policy', 'Escrow milestone alerts'),
    1,
    1,
    3
  ),
  (
    (SELECT id FROM users WHERE email = 'seller@kosescrow.local' LIMIT 1),
    'surabaya-hub',
    'Surabaya Transit Hub',
    'Surabaya, Indonesia',
    'Near business district',
    4.84,
    0.005,
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ),
    '',
    'Built for fast-moving professionals who need clean paperwork, visible transaction status, and quick occupancy confirmation from owners.',
    JSON_ARRAY('24/7 access', 'Business lounge', 'Lift access', 'Digital receipts', 'Admin-reviewed listing', 'Owner payout tracking'),
    1,
    1,
    4
  )
ON DUPLICATE KEY UPDATE
  owner_user_id = VALUES(owner_user_id),
  title = VALUES(title),
  location = VALUES(location),
  distance = VALUES(distance),
  rating = VALUES(rating),
  monthly_rent_eth = VALUES(monthly_rent_eth),
  image_url = VALUES(image_url),
  image_urls = VALUES(image_urls),
  gradient = VALUES(gradient),
  description = VALUES(description),
  amenities = VALUES(amenities),
  verified = VALUES(verified),
  featured = VALUES(featured),
  sort_order = VALUES(sort_order);

INSERT INTO property_reviews (
  property_id,
  user_id,
  rating,
  comment
)
SELECT
  p.id,
  u.id,
  seed.rating,
  seed.comment
FROM (
  SELECT 'sunrise-kebayoran' AS property_slug, 'buyer@kosescrow.local' AS reviewer_email, 5 AS rating, 'The place matched the photos, the owner responded quickly, and the rent flow felt clear from start to finish.' AS comment
  UNION ALL
  SELECT 'sunrise-kebayoran', 'campus@kosescrow.local', 4, 'Clean room, smooth move-in, and the building access felt secure. Wi-Fi stayed reliable during my stay.'
  UNION ALL
  SELECT 'tugu-loft', 'remote@kosescrow.local', 5, 'Great for remote work. The desk setup and quiet evenings made it easy to settle in fast.'
  UNION ALL
  SELECT 'tugu-loft', 'buyer@kosescrow.local', 4, 'Comfortable place overall and the owner was helpful, though the shared kitchen got busy at peak hours.'
  UNION ALL
  SELECT 'dago-garden', 'transit@kosescrow.local', 5, 'Peaceful area, fresh air, and the owner communication stayed consistent throughout the rental period.'
  UNION ALL
  SELECT 'surabaya-hub', 'remote@kosescrow.local', 4, 'Very practical for work trips. Access was easy and the monthly process felt organized.'
) AS seed
INNER JOIN properties p ON p.slug = seed.property_slug
INNER JOIN users u ON u.email = seed.reviewer_email
ON DUPLICATE KEY UPDATE
  rating = VALUES(rating),
  comment = VALUES(comment),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO admin_tasks (
  eyebrow,
  title,
  badge,
  description,
  items,
  sort_order
)
VALUES
  (
    'Verification queue',
    'Property approval',
    '12 pending',
    'Review document completeness, owner wallet bindings, and listing readiness before exposing properties to tenants.',
    JSON_ARRAY('Validate property images', 'Check owner identity', 'Approve full ETH rent terms'),
    1
  ),
  (
    'Platform trust',
    'Users and disputes',
    '3 flagged',
    'Track accounts, escalate suspicious activity, and keep a manual resolution path while on-chain rules remain simple.',
    JSON_ARRAY('Monitor suspicious wallets', 'Resolve occupancy disputes', 'Audit support escalations'),
    2
  ),
  (
    'Escrow visibility',
    'Transaction monitoring',
    'Live',
    'A reporting hub for contract events, release timing, and incomplete confirmations that need operational attention.',
    JSON_ARRAY('Watch recent tx hashes', 'Identify stuck confirmations', 'Export operational reports'),
    3
  ),
  (
    'Roadmap',
    'Future contract features',
    'Backlog',
    'The setup brief already points to future improvements, and this panel keeps those technical extensions visible.',
    JSON_ARRAY('Refund system', 'Dispute smart contract', 'IPFS document storage'),
    4
  )
ON DUPLICATE KEY UPDATE
  eyebrow = VALUES(eyebrow),
  badge = VALUES(badge),
  description = VALUES(description),
  items = VALUES(items),
  sort_order = VALUES(sort_order);
