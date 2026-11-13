import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const navigate = useNavigate();
  const cartCount = useSelector((state) =>
    state.cart.items.reduce((total, item) => total + (Number(item.quantity) || 1), 0)
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-emerald-50 text-emerald-800"
        : "text-slate-600 hover:bg-slate-50 hover:text-emerald-800"
    }`;

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="RentCampy, beranda"
            onClick={closeMenu}
          >
            <img src="/Logo.png" alt="" className="h-11 w-11 object-contain" />
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Rent<span className="text-emerald-700">Campy</span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Navigasi utama"
          >
            <NavLink to="/" end className={navLinkClass}>
              Beranda
            </NavLink>
            <NavLink to="/Contact" className={navLinkClass}>
              Hubungi Kami
            </NavLink>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => navigate("/cart")}
              aria-label={`Buka keranjang${cartCount ? `, ${cartCount} item` : ""}`}
              className="relative rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-emerald-800"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L21 8H6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="20" r="1.4" fill="currentColor" />
                <circle cx="18" cy="20" r="1.4" fill="currentColor" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-emerald-950">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => navigate("/Register")}
              className="rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >
              Daftar
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          >
            {menuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav
            className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden"
            aria-label="Navigasi mobile"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>
                Beranda
              </NavLink>
              <NavLink
                to="/Contact"
                className={navLinkClass}
                onClick={closeMenu}
              >
                Hubungi Kami
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  navigate("/cart");
                }}
                className="flex items-center justify-between rounded-full px-4 py-2 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-emerald-800"
              >
                Keranjang
                {cartCount > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                    {cartCount}
                  </span>
                )}
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    navigate("/login");
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    navigate("/Register");
                  }}
                  className="rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-900"
                >
                  Daftar
                </button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
