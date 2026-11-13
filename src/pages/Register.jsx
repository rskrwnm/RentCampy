import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 4) {
      setErrorMessage("Password minimal 4 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password belum sama.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/register", { email: email.trim(), password });
      setSuccessMessage("Akun berhasil dibuat. Mengalihkan ke halaman login...");
      window.setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Registrasi gagal. Silakan coba lagi."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10";

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#f4f7f5] px-4 py-8 sm:px-6 lg:flex lg:items-center lg:justify-center lg:py-12">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-emerald-950/10 lg:min-h-[640px] lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0f766e] p-10 text-white lg:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />

          <Link to="/" className="relative flex w-fit items-center gap-3">
            <img src="/Logo.png" alt="RentCampy" className="h-12 w-12 rounded-xl object-cover" />
            <span className="text-xl font-bold tracking-wide">RentCampy</span>
          </Link>

          <div className="relative">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Mulai petualanganmu
            </p>
            <h1 className="max-w-md text-4xl font-bold leading-tight">
              Buat cerita baru di alam terbuka.
            </h1>
            <p className="mt-4 max-w-md leading-7 text-emerald-50/85">
              Daftar untuk menemukan dan menyewa perlengkapan camping sesuai kebutuhanmu.
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

            <div className="mb-7">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-700">
                Bergabung dengan RentCampy
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Buat akun baru
              </h2>
              <p className="mt-3 text-gray-500">
                Daftar untuk mulai merencanakan petualanganmu.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-gray-700">
                  Alamat email
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  placeholder="nama@email.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={4}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    placeholder="Minimal 4 karakter"
                    className={`${inputClass} pr-20`}
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
                {password && (
                  <p className={`mt-1.5 text-xs ${password.length >= 4 ? "text-emerald-700" : "text-gray-500"}`}>
                    {password.length >= 4
                      ? "Password memenuhi panjang minimum."
                      : `${4 - password.length} karakter lagi untuk memenuhi minimum.`}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-gray-700">
                  Konfirmasi password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    placeholder="Ulangi password"
                    className={`${inputClass} pr-20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                    aria-pressed={showConfirmPassword}
                    className="absolute inset-y-0 right-0 rounded-r-xl px-4 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
                  >
                    {showConfirmPassword ? "Sembunyikan" : "Lihat"}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`mt-1.5 text-xs ${password === confirmPassword ? "text-emerald-700" : "text-amber-700"}`}>
                    {password === confirmPassword
                      ? "Password sudah cocok."
                      : "Konfirmasi password belum cocok."}
                  </p>
                )}
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || Boolean(successMessage)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl hover:shadow-emerald-700/25 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <svg aria-hidden="true" className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                    </svg>
                    Membuat akun...
                  </>
                ) : (
                  "Buat akun"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="font-semibold text-emerald-700 transition hover:text-emerald-900 hover:underline"
              >
                Masuk
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;
