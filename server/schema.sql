CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  category    TEXT[]       NOT NULL,
  image       TEXT,
  description TEXT         NOT NULL,
  price       INTEGER      NOT NULL CHECK (price >= 0),
  stock       INTEGER      NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0);

CREATE INDEX IF NOT EXISTS idx_products_category ON products USING GIN (category);

CREATE TABLE IF NOT EXISTS rental_orders (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'borrowed', 'returned', 'rejected', 'cancelled')),
  delivery_address TEXT NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  rental_days      INTEGER NOT NULL CHECK (rental_days > 0),
  total_amount     BIGINT NOT NULL CHECK (total_amount >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS rental_order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
  product_id   INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  category     TEXT[] NOT NULL,
  unit_price   INTEGER NOT NULL CHECK (unit_price >= 0),
  quantity     INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_rental_orders_user_created
  ON rental_orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rental_orders_status_dates
  ON rental_orders (status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rental_order_items_order
  ON rental_order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_rental_order_items_product
  ON rental_order_items (product_id);
