// Mengisi data dummy produk. Jalankan: npm run db:seed
// Hanya mengisi jika tabel products masih kosong.
import pool from "./db.js";

const COLORS = {
  Tenda: "#2e7d32",
  "Alat Tidur": "#1565c0",
  "Peralatan Masak": "#ef6c00",
};

// Gambar placeholder berupa SVG (data URL) agar tidak butuh file/koneksi luar.
const makeImage = (name, category) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
<rect width="400" height="300" fill="${COLORS[category]}"/>
<text x="200" y="140" font-family="Arial" font-size="26" font-weight="bold" fill="#fff" text-anchor="middle">${name}</text>
<text x="200" y="180" font-family="Arial" font-size="18" fill="#fff" text-anchor="middle">${category}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

const products = [
  ["Tenda Dome 2 Orang", "Tenda", "Tenda dome ringan untuk 2 orang, double layer, anti air dan mudah dipasang. Cocok untuk pendakian.", 50000],
  ["Tenda Dome 4 Orang", "Tenda", "Tenda dome kapasitas 4 orang dengan ruang luas dan ventilasi baik. Cocok untuk camping keluarga.", 80000],
  ["Tenda Family 6 Orang", "Tenda", "Tenda besar untuk 6 orang dengan dua pintu dan teras. Ideal untuk camping rombongan.", 120000],
  ["Tenda Ultralight 1 Orang", "Tenda", "Tenda super ringan untuk solo hiking, berat hanya sekitar 1,5 kg dan ringkas saat dilipat.", 40000],
  ["Sleeping Bag Polar", "Alat Tidur", "Sleeping bag bahan polar yang hangat dan nyaman, cocok untuk suhu dingin di pegunungan.", 25000],
  ["Sleeping Bag Dacron", "Alat Tidur", "Sleeping bag dacron ringan dan mudah dicuci, cocok untuk camping di dataran rendah.", 20000],
  ["Matras Gulung", "Alat Tidur", "Matras gulung busa tebal sebagai alas tidur, melindungi dari dinginnya tanah.", 10000],
  ["Hammock", "Alat Tidur", "Hammock parasut kuat dan ringan, dilengkapi tali pengikat. Beban maksimal 200 kg.", 15000],
  ["Kompor Portable", "Peralatan Masak", "Kompor gas portable dengan pemantik otomatis, praktis untuk memasak di alam terbuka.", 15000],
  ["Nesting Set", "Peralatan Masak", "Satu set panci dan wajan aluminium yang bisa ditumpuk, hemat tempat di dalam tas.", 20000],
  ["Gas Kaleng", "Peralatan Masak", "Tabung gas butana untuk kompor portable, tersedia untuk sekali pakai selama camping.", 10000],
  ["Cooler Box", "Peralatan Masak", "Kotak pendingin untuk menyimpan makanan dan minuman tetap segar selama perjalanan.", 30000],
  ["Tenda Tunnel 4 Orang", "Tenda", "Tenda tunnel dengan ruang tidur luas dan teras untuk menyimpan perlengkapan camping.", 95000],
  ["Tenda Geodesic 3 Orang", "Tenda", "Tenda geodesic kokoh untuk menghadapi cuaca berangin di area perkemahan.", 85000],
  ["Tenda Camping Instan", "Tenda", "Tenda praktis dengan rangka otomatis yang mudah dibuka dan dilipat kembali.", 65000],
  ["Flysheet Camping", "Tenda", "Flysheet serbaguna sebagai pelindung tambahan dari hujan dan terik matahari.", 20000],
  ["Sleeping Bag Mumet", "Alat Tidur", "Sleeping bag hangat dengan bentuk nyaman untuk menjaga suhu tubuh saat malam.", 28000],
  ["Matras Angin", "Alat Tidur", "Matras angin ringan yang dapat dikempiskan agar ringkas dibawa saat hiking.", 25000],
  ["Bantal Angin", "Alat Tidur", "Bantal tiup ringan untuk menambah kenyamanan saat beristirahat di tenda.", 10000],
  ["Selimut Camping", "Alat Tidur", "Selimut ringan sebagai lapisan tambahan agar tetap hangat saat beristirahat.", 18000],
  ["Kursi Lipat Camping", "Peralatan Masak", "Kursi lipat ringan dengan rangka kuat untuk bersantai di area perkemahan.", 20000],
  ["Meja Lipat Camping", "Peralatan Masak", "Meja lipat ringkas untuk menyiapkan makanan dan perlengkapan camping.", 25000],
  ["Lampu Camping LED", "Peralatan Masak", "Lampu LED hemat daya dengan pengait untuk menerangi bagian dalam tenda.", 15000],
  ["Peralatan Makan Set", "Peralatan Masak", "Set alat makan camping yang berisi piring, mangkuk, gelas, dan sendok.", 12000],
  ["Teko Camping", "Peralatan Masak", "Teko aluminium ringan untuk merebus air menggunakan kompor portable.", 12000],
  ["Grill Portable", "Peralatan Masak", "Pemanggang lipat ringkas untuk memasak makanan di area camping.", 25000],
  ["Pompa Matras", "Alat Tidur", "Pompa tangan praktis untuk mengisi matras angin tanpa membutuhkan listrik.", 10000],
  ["Tenda Dome 3 Orang", "Tenda", "Tenda dome tiga orang dengan ventilasi dan lapisan pelindung hujan.", 70000],
  ["Nesting Mini", "Peralatan Masak", "Nesting ringkas untuk satu sampai dua orang, cocok untuk perjalanan singkat.", 15000],
  ["Tenda Footprint", "Tenda", "Alas tambahan untuk melindungi bagian bawah tenda dari tanah lembap dan benda tajam.", 12000],
];

let insertedCount = 0;
for (const [name, category, description, price] of products) {
  const { rowCount } = await pool.query(
    `INSERT INTO products (name, category, image, description, price)
     SELECT $1::varchar, $2, $3, $4, $5
     WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = $1::varchar)`,
    [name, [category], makeImage(name, category), description, price]
  );
  insertedCount += rowCount;
}
console.log(`${insertedCount} produk dummy ditambahkan.`);
await pool.end();
