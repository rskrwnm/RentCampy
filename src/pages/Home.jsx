import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { isLoggedIn as checkIsLoggedIn } from "../auth";
import { addItem } from "../features/cartSlice";

import Card from "../components/Card";

const FEATURES = [
  {
    icon: "01",
    title: "Harga bersahabat",
    text: "Sewa harian yang ramah di kantong, tanpa perlu beli perlengkapan sendiri.",
  },
  {
    icon: "02",
    title: "Selalu terawat",
    text: "Setiap perlengkapan diperiksa dan dibersihkan sebelum sampai kepadamu.",
  },
  {
    icon: "03",
    title: "Semua ada di sini",
    text: "Tenda, alat tidur, hingga perlengkapan masak dalam satu tempat.",
  },
];

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const productsRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const isUserLoggedIn = checkIsLoggedIn();

  const handleAddToCart = (product) => {
    const newItem = {
      id: product?.id,
      name: product?.name,
      image: product?.image,
      category: product?.category,
      description: product?.description,
      price: product?.price,
    };
    dispatch(addItem(newItem));
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const response = await api.get("/products");
        if (active) {
          setProducts(
            isUserLoggedIn ? response.data : response.data.slice(0, 6),
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [isUserLoggedIn]);

  const keyword = search.trim().toLowerCase();
  const visibleProducts = keyword
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.description?.toLowerCase().includes(keyword),
      )
    : products;

  return (
    <div className="overflow-hidden bg-[#fbfaf6] text-slate-900">
      <section className="relative isolate bg-[#f2f1e7]">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[24rem] w-[24rem] rounded-full bg-amber-100/80 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-4 lg:px-10 lg:py-24">
          <div className="relative z-10">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-900 shadow-sm sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Petualangan dimulai di sini
            </span>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl">
              Keluar sebentar,
              <span className="mt-1 block font-serif font-medium italic text-emerald-800">
                ceritanya selamanya.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Sewa perlengkapan camping berkualitas tanpa harus membeli
              semuanya. Pilih gear favoritmu, lalu fokus menikmati alam.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  productsRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center justify-center gap-3 rounded-full bg-emerald-800 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/15 transition hover:-translate-y-0.5 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
              >
                Jelajahi perlengkapan
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {!isUserLoggedIn && (
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="rounded-full border border-emerald-900/20 bg-white/60 px-7 py-3.5 text-sm font-bold text-emerald-950 transition hover:bg-white"
                >
                  Buat akun
                </button>
              )}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5 text-emerald-700"
                  aria-hidden="true"
                >
                  <path
                    d="m5 10 3.2 3.2L15.5 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                Gear terawat
              </span>
              <span className="inline-flex items-center gap-2">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5 text-emerald-700"
                  aria-hidden="true"
                >
                  <path
                    d="M10 2.5 12.3 7l5 .7-3.6 3.5.8 5-4.5-2.4-4.5 2.4.8-5-3.6-3.5 5-.7L10 2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                Harga transparan
              </span>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-2xl items-center justify-center lg:min-h-[30rem]">
            <div className="absolute inset-8 rounded-[3rem] bg-gradient-to-br from-emerald-900 to-emerald-700 shadow-2xl shadow-emerald-950/20 sm:inset-12 sm:rotate-2" />
            <div className="absolute right-8 top-8 h-20 w-20 rounded-full border border-white/30 sm:right-14 sm:top-10" />
            <img
              src="/welcome-image.png"
              alt="Perlengkapan camping siap menemani petualangan"
              className="relative z-10 w-full max-w-[34rem] drop-shadow-2xl"
            />
            <div className="absolute bottom-1 left-0 z-20 max-w-[15rem] rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur sm:bottom-4 sm:left-2 sm:p-5">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl"
                  aria-hidden="true"
                >
                  🏕️
                </span>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Rencana camping?
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Gear-nya biar kami siapkan.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-5 z-20 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-xs font-bold text-emerald-900 shadow-lg sm:right-2 sm:top-10 sm:px-5 sm:py-3 sm:text-sm">
              Siap untuk alam bebas
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-2 max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex gap-4 p-6 sm:p-7 ${index < FEATURES.length - 1 ? "border-b border-slate-100 md:border-b-0 md:border-r" : ""}`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-black tracking-wide text-emerald-800">
                {feature.icon}
              </span>
              <div>
                <h2 className="font-bold text-slate-900">{feature.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {feature.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={productsRef}
        className="mx-auto max-w-7xl scroll-mt-32 px-5 py-14 sm:px-8 sm:py-20 lg:px-10"
      >
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              {isUserLoggedIn ? "Katalog lengkap" : "Favorit penyewa"}
            </span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {isUserLoggedIn ? "Semua perlengkapan" : "Paling sering disewa"}
            </h2>
            <p className="mt-2 text-slate-500">
              {isUserLoggedIn
                ? "Jelajahi seluruh perlengkapan untuk petualanganmu."
                : "Pilihan perlengkapan yang paling sering disewa pelanggan kami."}
            </p>
          </div>
          <div className="text-sm font-medium text-slate-500">
            {isUserLoggedIn
              ? `${products.length} perlengkapan tersedia`
              : `${products.length} produk populer`}
          </div>
        </div>

        <div className="mb-8 max-w-lg">
          <label htmlFor="product-search" className="sr-only">
            Cari produk
          </label>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
              />
            </svg>
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tenda, kompor, alat tidur..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-100 bg-white py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700"></div>
            <p className="font-medium text-slate-500">
              Menyiapkan perlengkapan...
            </p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="text-4xl" aria-hidden="true">
              🔎
            </span>
            <p className="mt-4 font-semibold text-slate-700">
              {keyword
                ? `Produk "${search.trim()}" tidak ditemukan.`
                : "Belum ada produk."}
            </p>
            {keyword && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-3 text-sm font-bold text-emerald-700 hover:text-emerald-900"
              >
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <Card
                key={product.id}
                id={product.id}
                name={product.name}
                category={product.category}
                image={product.image}
                price={product.price}
                stock={product.stock}
                showCartButton={true}
                handleNavigateDetails={() => {
                  navigate(`/productdetail/${product.id}`, {
                    state: { product },
                  });
                }}
                handleAddtoCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="bg-emerald-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-8 text-center sm:px-8 lg:px-10">
          <p className="text-sm text-emerald-100/70">
            © {new Date().getFullYear()} RentCampy. Bawa pulang cerita, bukan
            perlengkapannya.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
