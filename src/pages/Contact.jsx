import { useState } from "react";

function Contact() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [pesan, setPesan] = useState("");
  const [isDraftPrepared, setIsDraftPrepared] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Pertanyaan RentCampy dari ${nama.trim()}`);
    const body = encodeURIComponent(
      `Nama: ${nama.trim()}\nEmail: ${email.trim()}\n\nPesan:\n${pesan.trim()}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsDraftPrepared(true);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";

  return (
    <main className="min-h-screen bg-[#fbfaf6] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <div className="absolute -right-20 -top-32 -z-10 h-96 w-96 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 -z-10 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200 sm:text-sm">
            Kami siap membantu
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            Ada yang ingin ditanyakan sebelum berpetualang?
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/80 sm:text-base">
            Tanyakan tentang perlengkapan, ketersediaan, atau proses penyewaan. Ceritakan kebutuhanmu, kami akan bantu sebisa mungkin.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M4 6.5h16v11H4v-11Zm0 1 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Kami siap membantu
          </div>
        </section>

        <div className="-mt-5 grid gap-6 px-2 sm:px-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
          <aside className="space-y-4 pt-10 lg:pt-14">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M4 6.5h16v11H4v-11Zm0 1 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="mt-4 font-bold text-slate-900">Kirim melalui email</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Form akan menyiapkan draft di aplikasi email perangkatmu. Pilih alamat tujuan sebelum mengirim.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </span>
              <h2 className="mt-4 font-bold text-slate-900">Tentang penyewaan</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Sertakan nama perlengkapan dan tanggal rencana camping agar kami dapat membantu lebih cepat.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-5 sm:p-6">
              <p className="text-sm font-bold text-emerald-950">Tips sebelum menghubungi</p>
              <p className="mt-2 text-sm leading-6 text-emerald-900/75">
                Cek detail dan stok perlengkapan di katalog. Ketersediaan untuk tanggal tertentu akan diverifikasi saat checkout.
              </p>
            </div>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8 lg:p-9">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Hubungi RentCampy</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Kirim pesan
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Isi form di bawah. Aplikasi email akan terbuka untuk mengirim pesan ke tim kami.
              </p>
            </div>

            {isDraftPrepared && (
              <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                Draft pesan sudah disiapkan. Pilih alamat penerima dan kirim melalui aplikasi email untuk menyampaikan pesan.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="nama" className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama
                </label>
                <input
                  type="text"
                  id="nama"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength="100"
                  value={nama}
                  onChange={(event) => {
                    setNama(event.target.value);
                    setIsDraftPrepared(false);
                  }}
                  placeholder="Nama kamu"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  maxLength="254"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setIsDraftPrepared(false);
                  }}
                  placeholder="nama@email.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="pesan" className="mb-2 block text-sm font-semibold text-slate-700">
                  Pesan
                </label>
                <textarea
                  id="pesan"
                  name="message"
                  rows="5"
                  required
                  minLength="10"
                  maxLength="2000"
                  value={pesan}
                  onChange={(event) => {
                    setPesan(event.target.value);
                    setIsDraftPrepared(false);
                  }}
                  placeholder="Ceritakan pertanyaan atau kebutuhanmu..."
                  className={`${inputClass} resize-y`}
                />
                <p className="mt-1.5 text-right text-xs text-slate-400">{pesan.length}/2000</p>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 sm:w-auto"
              >
                Buka aplikasi email
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M7 17 17 7M7 7h10v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Contact;
