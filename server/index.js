import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "ganti-secret-ini-di-env";

app.use(cors());
// Gambar produk disimpan sebagai data URL base64, jadi batas body dinaikkan.
app.use(express.json({ limit: "10mb" }));

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Login diperlukan." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token tidak valid atau kedaluwarsa." });
  }
};

const requireAdmin = (req, res, next) =>
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Hanya admin yang boleh." });
    }
    next();
  });

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
};

const rentalDaysBetween = (startDate, endDate) =>
  Math.floor(
    (Date.parse(`${endDate}T00:00:00.000Z`) -
      Date.parse(`${startDate}T00:00:00.000Z`)) /
      86400000
  ) + 1;

const getMaxReservedStock = async (client, productId) => {
  const { rows } = await client.query(
    `SELECT TO_CHAR(o.start_date, 'YYYY-MM-DD') AS start_date,
            TO_CHAR(o.end_date, 'YYYY-MM-DD') AS end_date,
            oi.quantity
     FROM rental_order_items oi
     JOIN rental_orders o ON o.id = oi.order_id
     WHERE oi.product_id = $1 AND o.status = ANY($2::text[])`,
    [productId, ["pending", "approved", "borrowed"]]
  );
  const changes = new Map();
  for (const row of rows) {
    const start = Date.parse(`${row.start_date}T00:00:00.000Z`);
    const afterEnd = Date.parse(`${row.end_date}T00:00:00.000Z`) + 86400000;
    changes.set(start, (changes.get(start) || 0) + row.quantity);
    changes.set(afterEnd, (changes.get(afterEnd) || 0) - row.quantity);
  }
  let reserved = 0;
  let maximum = 0;
  for (const [, change] of [...changes].sort(([a], [b]) => a - b)) {
    reserved += change;
    maximum = Math.max(maximum, reserved);
  }
  return maximum;
};

// ---------- Auth ----------
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 4) {
    return res.status(400).json({ message: "Email dan password (min. 4 karakter) wajib diisi." });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, 'user')",
      [email.trim().toLowerCase(), hash]
    );
    res.status(201).json({ message: "Registrasi berhasil." });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.trim().toLowerCase(),
    ]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email atau password salah." });
    }
    res.json({
      token: signToken(user),
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

// Dipakai frontend untuk memverifikasi sesi dan role dari sumber yang benar (database),
// bukan dari localStorage yang bisa diubah pengguna.
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!rows[0]) return res.status(401).json({ message: "Akun tidak ditemukan." });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

// ---------- Rental orders ----------
app.post("/api/orders", requireAuth, async (req, res) => {
  const { items, deliveryAddress, startDate, endDate } = req.body;
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ message: "Keranjang kosong atau jumlah item tidak valid." });
  }
  if (typeof deliveryAddress !== "string" || deliveryAddress.trim().length < 5 || deliveryAddress.trim().length > 500) {
    return res.status(400).json({ message: "Alamat pengiriman harus berisi 5 sampai 500 karakter." });
  }
  if (!isValidDate(startDate) || !isValidDate(endDate) || endDate < startDate) {
    return res.status(400).json({ message: "Tanggal peminjaman tidak valid." });
  }
  const today = new Date().toISOString().slice(0, 10);
  if (startDate < today) {
    return res.status(400).json({ message: "Tanggal mulai tidak boleh di masa lalu." });
  }

  const quantities = new Map();
  for (const item of items) {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Produk dan jumlah harus valid." });
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }

  const rentalDays = rentalDaysBetween(startDate, endDate);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const productIds = [...quantities.keys()].sort((a, b) => a - b);
    const { rows: products } = await client.query(
      "SELECT id, name, category, price, stock FROM products WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE",
      [productIds]
    );
    if (products.length !== productIds.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Salah satu produk sudah tidak tersedia." });
    }

    const { rows: reservedRows } = await client.query(
      `SELECT oi.product_id, COALESCE(SUM(oi.quantity), 0)::int AS quantity
       FROM rental_order_items oi
       JOIN rental_orders o ON o.id = oi.order_id
       WHERE oi.product_id = ANY($1::int[])
         AND o.status = ANY($2::text[])
         AND o.start_date <= $4::date
         AND o.end_date >= $3::date
       GROUP BY oi.product_id`,
      [productIds, ["pending", "approved", "borrowed"], startDate, endDate]
    );
    const reservedByProduct = new Map(
      reservedRows.map((row) => [row.product_id, row.quantity])
    );
    for (const product of products) {
      const available = product.stock - (reservedByProduct.get(product.id) || 0);
      if (quantities.get(product.id) > available) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: `Stok ${product.name} tidak cukup untuk tanggal tersebut. Tersedia ${Math.max(available, 0)} unit.`,
        });
      }
    }

    const totalAmount = products.reduce(
      (total, product) =>
        total + product.price * quantities.get(product.id) * rentalDays,
      0
    );
    if (!Number.isSafeInteger(totalAmount)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Total pesanan melebihi batas yang didukung." });
    }

    const { rows: orderRows } = await client.query(
      `INSERT INTO rental_orders
         (user_id, delivery_address, start_date, end_date, rental_days, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user.id,
        deliveryAddress.trim(),
        startDate,
        endDate,
        rentalDays,
        String(totalAmount),
      ]
    );
    const order = orderRows[0];
    order.start_date = startDate;
    order.end_date = endDate;
    for (const product of products) {
      await client.query(
        `INSERT INTO rental_order_items
           (order_id, product_id, product_name, category, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, product.id, product.name, product.category, product.price, quantities.get(product.id)]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ ...order, items: products.map((product) => ({
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      unit_price: product.price,
      quantity: quantities.get(product.id),
    })) });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan pesanan." });
  } finally {
    client.release();
  }
});

const getOrdersWithItems = async (query, values) => {
  const { rows: orders } = await pool.query(query, values);
  if (orders.length === 0) return orders;
  const { rows: items } = await pool.query(
    `SELECT order_id, product_id, product_name, category, unit_price, quantity
     FROM rental_order_items WHERE order_id = ANY($1::int[]) ORDER BY id`,
    [orders.map((order) => order.id)]
  );
  const itemsByOrder = new Map(orders.map((order) => [order.id, []]));
  for (const item of items) itemsByOrder.get(item.order_id).push(item);
  return orders.map((order) => ({ ...order, items: itemsByOrder.get(order.id) }));
};

app.get("/api/orders/my", requireAuth, async (req, res) => {
  try {
    const orders = await getOrdersWithItems(
      `SELECT id, user_id, status, delivery_address,
              TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
              TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
              rental_days, total_amount, created_at, updated_at
       FROM rental_orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memuat pesanan." });
  }
});

app.patch("/api/orders/:id/cancel", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE rental_orders SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'pending'
       RETURNING id, status, updated_at`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) {
      return res.status(409).json({ message: "Pesanan tidak ditemukan atau sudah diproses admin." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membatalkan pesanan." });
  }
});

// ---------- Admin ----------
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [products, users, orders, pendingOrders, byCategory, latest] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS n FROM products"),
      pool.query("SELECT COUNT(*)::int AS n FROM users WHERE role = 'user'"),
      pool.query("SELECT COUNT(*)::int AS n FROM rental_orders"),
      pool.query("SELECT COUNT(*)::int AS n FROM rental_orders WHERE status = 'pending'"),
      pool.query(
        `SELECT c AS category, COUNT(*)::int AS count
         FROM products, UNNEST(category) AS c
         GROUP BY c ORDER BY c`
      ),
      pool.query(
        "SELECT id, name, category, image, price FROM products ORDER BY id DESC LIMIT 5"
      ),
    ]);
    res.json({
      totalProducts: products.rows[0].n,
      totalUsers: users.rows[0].n,
      totalOrders: orders.rows[0].n,
      pendingOrders: pendingOrders.rows[0].n,
      byCategory: byCategory.rows,
      latestProducts: latest.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  try {
    const orders = await getOrdersWithItems(
      `SELECT o.id, o.user_id, o.status, o.delivery_address,
              TO_CHAR(o.start_date, 'YYYY-MM-DD') AS start_date,
              TO_CHAR(o.end_date, 'YYYY-MM-DD') AS end_date,
              o.rental_days, o.total_amount, o.created_at, o.updated_at,
              u.email AS user_email
       FROM rental_orders o JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`,
      []
    );
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memuat pesanan." });
  }
});

app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const transitions = {
    pending: ["approved", "rejected"],
    approved: ["borrowed"],
    borrowed: ["returned"],
  };
  const { status } = req.body;
  if (!["approved", "rejected", "borrowed", "returned"].includes(status)) {
    return res.status(400).json({ message: "Status pesanan tidak valid." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT id, status FROM rental_orders WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );
    if (!rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }
    if (!transitions[rows[0].status]?.includes(status)) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Perubahan status pesanan tidak diizinkan." });
    }
    const { rows: updated } = await client.query(
      `UPDATE rental_orders SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, status, updated_at`,
      [status, req.params.id]
    );
    await client.query("COMMIT");
    res.json(updated[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui status pesanan." });
  } finally {
    client.release();
  }
});

// ---------- Admin: kelola user ----------
const ROLES = ["user", "admin"];

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, email, role, created_at FROM users ORDER BY id"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

app.post("/api/admin/users", requireAdmin, async (req, res) => {
  const { email, password, role = "user" } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Format email tidak valid." });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ message: "Password minimal 4 karakter." });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: "Role tidak valid." });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password, role) VALUES ($1, $2, $3)
       RETURNING id, email, role, created_at`,
      [email.trim().toLowerCase(), hash, role]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

app.put("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: "Role tidak valid." });
  }
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ message: "Anda tidak bisa mengubah role akun sendiri." });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2
       RETURNING id, email, role, created_at`,
      [role, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "User tidak ditemukan." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ message: "Anda tidak bisa menghapus akun sendiri." });
  }
  try {
    const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [
      req.params.id,
    ]);
    if (!rowCount) return res.status(404).json({ message: "User tidak ditemukan." });
    res.json({ message: "User dihapus." });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ message: "User memiliki riwayat peminjaman dan tidak dapat dihapus." });
    }
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

// ---------- Products ----------
const validateProduct = ({ name, category, description, price, stock }) => {
  if (!name || !name.trim()) return "Nama produk wajib diisi.";
  if (!Array.isArray(category) || category.length === 0) return "Kategori wajib diisi.";
  if (!description || !description.trim()) return "Deskripsi wajib diisi.";
  if (!Number.isInteger(Number(price)) || Number(price) < 0) return "Harga harus bilangan bulat >= 0.";
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) return "Stok harus bilangan bulat >= 0.";
  return null;
};

app.get("/api/products", async (req, res) => {
  try {
    const { category } = req.query;
    const { rows } = category
      ? await pool.query(
          "SELECT * FROM products WHERE $1 = ANY(category) ORDER BY id",
          [category]
        )
      : await pool.query("SELECT * FROM products ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: "Produk tidak ditemukan." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

app.post("/api/products", requireAdmin, async (req, res) => {
  const error = validateProduct(req.body);
  if (error) return res.status(400).json({ message: error });
  const { name, category, image, description, price, stock } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, category, image, description, price, stock)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name.trim(), category, image || null, description, Number(price), Number(stock)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

app.put("/api/products/:id", requireAdmin, async (req, res) => {
  const error = validateProduct(req.body);
  if (error) return res.status(400).json({ message: error });
  const { name, category, image, description, price, stock } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: currentRows } = await client.query(
      "SELECT id FROM products WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );
    if (!currentRows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }
    const maxReserved = await getMaxReservedStock(client, Number(req.params.id));
    if (Number(stock) < maxReserved) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Stok tidak dapat dikurangi di bawah ${maxReserved} unit yang sudah dipesan pada tanggal yang sama.`,
      });
    }
    const { rows } = await client.query(
      `UPDATE products
       SET name = $1, category = $2, image = COALESCE($3, image), description = $4, price = $5, stock = $6
       WHERE id = $7 RETURNING *`,
      [name.trim(), category, image || null, description, Number(price), Number(stock), req.params.id]
    );
    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  } finally {
    client.release();
  }
});

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: products } = await client.query(
      "SELECT id FROM products WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );
    if (!products[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }
    const { rows: activeOrders } = await client.query(
      `SELECT 1 FROM rental_order_items oi
       JOIN rental_orders o ON o.id = oi.order_id
       WHERE oi.product_id = $1 AND o.status = ANY($2::text[])
       LIMIT 1`,
      [req.params.id, ["pending", "approved", "borrowed"]]
    );
    if (activeOrders.length) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Produk masih memiliki peminjaman aktif dan tidak dapat dihapus." });
    }
    await client.query("DELETE FROM products WHERE id = $1", [
      req.params.id,
    ]);
    await client.query("COMMIT");
    res.json({ message: "Produk dihapus." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => console.log(`API berjalan di http://localhost:${PORT}`));
