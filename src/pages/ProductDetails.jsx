import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import { addItem } from "../features/cartSlice";

const CATEGORY_STYLE = {
  Tenda: "bg-emerald-100 text-emerald-800",
  "Alat Tidur": "bg-sky-100 text-sky-800",
  "Peralatan Masak": "bg-amber-100 text-amber-800",
};

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(
    location.state?.product?.id === Number(id) ? location.state.product : null
  );
  const [loading, setLoading] = useState(!location.state?.product);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    setProduct(location.state?.product?.id === Number(id) ? location.state.product : null);
    setLoading(true);
    setErrorMessage("");
    document.title = "Detail Produk | RentCampy";

    api.get(`/products/${id}`)
      .then(({ data }) => {
        if (active) setProduct(data);
      })
      .catch((error) => {
        if (!active) return;
        if (error.response?.status === 404) {
          setErrorMessage("Produk yang kamu cari tidak ditemukan.");
        } else {
          setErrorMessage(getErrorMessage(error, "Detail produk gagal dimuat."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, location.state]);

  const handleAddToCart = () => {
    dispatch(addItem({
      id: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      description: product.description,
      price: product.price,
    }));
  };

  if (loading && !product) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#fbfaf6]">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
          <span className="font-medium">Memuat detail perlengkapan...</span>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#fbfaf6] px-4 py-12">
        <section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="text-5xl" aria-hidden="true">🏕️</span>
          <h1 className="mt-4 text-2xl font-black text-slate-950">Produk tidak ditemukan</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {errorMessage || "Perlengkapan ini mungkin sudah tidak tersedia."}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-emerald-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"
          >
            Kembali ke katalog
          </Link>
        </section>
      </main>
    );
  }

  const categories = Array.isArray(product.category) ? product.category : [product.category].filter(Boolean);
  const stock = Number(product.stock ?? 0);

  return (
    <main className="min-h-screen bg-[#fbfaf6] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="font-medium transition hover:text-emerald-800">Katalog</Link>
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-slate-300" aria-hidden="true">
            <path d="m7 4 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate font-semibold text-slate-800">{product.name}</span>
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <section className="relative overflow-hidden rounded-[2rem] border border-emerald-950/5 bg-[#f0efe7] p-5 sm:p-8 lg:sticky lg:top-32">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-200/50 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-amber-100/70 blur-3xl" />
            <div className="relative flex min-h-[19rem] items-center justify-center sm:min-h-[28rem]">
              <img
                src={product.image || "/welcome-image.png"}
                alt={product.name}
                className="max-h-[28rem] w-full rounded-2xl object-contain drop-shadow-xl"
              />
            </div>
            <div className="relative mt-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${CATEGORY_STYLE[category] || "bg-white text-slate-700"}`}
                >
                  {category}
                </span>
              ))}
            </div>
            <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-4 backdrop-blur">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">Siap menemani petualanganmu</p>
                <p className="mt-0.5 text-xs text-slate-500">Perlengkapan diperiksa sebelum disewakan.</p>
              </div>
            </div>
          </section>

          <section className="lg:py-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Detail perlengkapan</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <p className="text-sm text-slate-500">Harga sewa mulai dari</p>
                <p className="mt-1 text-3xl font-black tracking-tight text-emerald-800">
                  {formatRupiah(product.price)}
                  <span className="ml-1 text-sm font-medium text-slate-500">/ unit / hari</span>
                </p>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${stock > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                {stock > 0 ? `${stock} unit tersedia` : "Stok habis"}
              </span>
            </div>

            <div className="py-6">
              <h2 className="text-lg font-bold text-slate-900">Tentang perlengkapan ini</h2>
              <p className="mt-3 whitespace-pre-line text-base leading-7 text-slate-600">
                {product.description || "Belum ada deskripsi untuk perlengkapan ini."}
              </p>
            </div>

            <div className="grid gap-3 border-y border-slate-200 py-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800" aria-hidden="true">✓</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">Dihitung per hari</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Total akhir mengikuti jumlah barang dan lama sewa.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800" aria-hidden="true">↗</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">Cek ketersediaan tanggal</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Stok akan diperiksa saat kamu mengirim permohonan sewa.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock < 1}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-emerald-800 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0"
            >
              {stock > 0 ? "Tambahkan ke keranjang" : "Stok sedang habis"}
              {stock > 0 && (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-3 w-full rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-800 hover:text-emerald-800"
            >
              Kembali ke katalog
            </button>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;
