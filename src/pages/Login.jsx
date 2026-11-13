import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      const isAdmin = data.user.role === "admin";

      localStorage.setItem("token", data.token);
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("user", JSON.stringify(data.user));
      const returnTo = location.state?.returnTo;
      const destination =
        typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//")
          ? returnTo
          : "/";
      navigate(
        isAdmin ? "/admin" : destination,
        !isAdmin && location.state?.checkout ? { state: { checkout: location.state.checkout } } : undefined
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Login gagal. Silakan coba lagi."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#f4f7f5] px-4 py-8 sm:px-6 lg:flex lg:items-center lg:justify-center lg:py-12">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-emerald-950/10 lg:min-h-[600px] lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0f766e] p-10 text-white lg:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />

          <Link to="/" className="relative flex w-fit items-center gap-3">
            <img src="/Logo.png" alt="RentCampy" className="h-12 w-12 rounded-xl object-cover" />
            <span className="text-xl font-bold tracking-wide">RentCampy</span>
          </Link>

          <div className="relative">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Petualangan dimulai di sini
            </p>
            <h1 className="max-w-md text-4xl font-bold leading-tight">
              Siap menjelajah alam bebas?
            </h1>
            <p className="mt-4 max-w-md leading-7 text-emerald-50/85">
              Temukan perlengkapan camping favoritmu dan siapkan perjalanan yang tak terlupakan.
            </p>
            <img
              src="/welcome-image.png"
              alt="Perlengkapan camping RentCampy"
              className="mx-auto mt-8 h-56 w-full object-contain drop-shadow-2xl"
            />
          </div>

          <p className="relative text-sm text-emerald-100/70">
            Perlengkapan tepat, petualangan lebih hebat.
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-8 sm:px-12 lg:px-14">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
              <img src="/Logo.png" alt="" className="h-10 w-10 rounded-lg object-cover" />
              <span className="text-lg font-bold text-gray-900">RentCampy</span>
            </Link>

            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-700">
                Selamat datang kembali
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Masuk ke akunmu
              </h2>
              <p className="mt-3 text-gray-500">
                Masukkan detail akun untuk melanjutkan petualangan.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                  Alamat email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="Masukkan password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-20 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 rounded-r-xl px-4 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
                  >
                    {showPassword ? "Sembunyikan" : "Lihat"}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="mt-0.5 h-5 w-5 shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-1-11a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0V7Zm1 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl hover:shadow-emerald-700/25 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
                      />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.22 5.03a.75.75 0 1 1 1.06-1.06l5.45 5.5a.75.75 0 0 1 0 1.06l-5.45 5.5a.75.75 0 0 1-1.06-1.06l4.168-4.22H3.75A.75.75 0 0 1 3 10Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-gray-500">
              Belum punya akun?{" "}
              <Link
                to="/Register"
                className="font-semibold text-emerald-700 transition hover:text-emerald-900 hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
