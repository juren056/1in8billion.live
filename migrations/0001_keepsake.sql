CREATE TABLE IF NOT EXISTS keepsake_orders (
 id TEXT PRIMARY KEY, request_hash TEXT NOT NULL UNIQUE, product_key TEXT NOT NULL,
 life_commitment TEXT NOT NULL, claim_secret_hash TEXT NOT NULL,
 amount_total INTEGER NOT NULL CHECK(amount_total=299), currency TEXT NOT NULL CHECK(currency='usd'),
 status TEXT NOT NULL CHECK(status IN ('pending','paid','canceled','expired','refunded','disputed','needs_support')),
 stripe_session_id TEXT UNIQUE, stripe_payment_intent_id TEXT UNIQUE,
 created_at TEXT NOT NULL, paid_at TEXT, refunded_at TEXT, fulfillment_ready_at TEXT
);
CREATE TABLE IF NOT EXISTS processed_stripe_events(event_id TEXT PRIMARY KEY,processed_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS keepsake_limits(bucket TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);
