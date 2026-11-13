import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api, { getErrorMessage } from "../api";
import { removeItem, setItemQuantity } from "../features/cartSlice";
import { isLoggedIn } from "../auth";

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
const getToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const Cart = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const items = useSelector((state) => state.cart.items);
  const [selectedItemIds, setSelectedItemIds] = useState(() =>
    Array.isArray(location.state?.checkout?.selectedItemIds)
      ? location.state.checkout.selectedItemIds
      : items.map((item) => item.id)
  );
  const [deliveryAddress, setDeliveryAddress] = useState(location.state?.checkout?.deliveryAddress || "");
  const [startDate, setStartDate] = useState(location.state?.checkout?.startDate || "");
  const [endDate, setEndDate] = useState(location.state?.checkout?.endDate || "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const today = useMemo(getToday, []);
  const selectedItems = items.filter((item) => selectedItemIds.includes(item.id));

  const rentalDays = startDate && endDate && endDate >= startDate
    ? Math.floor((Date.parse(`${endDate}T00:00:00.000Z`) - Date.parse(`${startDate}T00:00:00.000Z`)) / 86400000) + 1
    : 0;
  const total = selectedItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * (Number(item.quantity) || 1),
    0
  ) * rentalDays;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (!selectedItems.length) {
      setErrorMessage("Pilih setidaknya satu produk yang ingin disewa.");
      return;
    }

    if (!isLoggedIn()) {
      const result = await Swal.fire({
        icon: "info",
        title: "Masuk untuk membuat pesanan",
        text: "Keranjangmu tetap tersimpan. Masuk terlebih dahulu untuk mengirim permohonan sewa.",
        showCancelButton: true,
        confirmButtonText: "Masuk",
        cancelButtonText: "Lanjut belanja",
        confirmButtonColor: "#047857",
        reverseButtons: true,
      });
      if (result.isConfirmed) {
        navigate("/login", {
          state: {
            returnTo: "/cart",
            checkout: { deliveryAddress, startDate, endDate, selectedItemIds },
          },
        });
      }
      return;
    }

    if (!event.currentTarget.reportValidity()) return;

    if (!rentalDays || !deliveryAddress.trim()) {
      setErrorMessage("Isi alamat dan tanggal sewa dengan benar sebelum mengajukan pesanan.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", {
        items: selectedItems.map((item) => ({
          productId: item.id,
          quantity: Number(item.quantity) || 1,
        })),
        deliveryAddress: deliveryAddress.trim(),
        startDate,
        endDate,
      });
      selectedItems.forEach((item) => dispatch(removeItem({ id: item.id })));
      await Swal.fire({
        icon: "success",
        title: "Permohonan terkirim",
        text: `Pesanan #${data.id} tersimpan. Admin akan meninjau permohonanmu.`,
        confirmButtonColor: "#047857",
      });
      navigate("/orders");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Pesanan gagal disimpan. Silakan coba lagi."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Checkout penyewaan</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Keranjangmu</h1>
          <p className="mt-2 text-slate-500">
            Pilih perlengkapan yang ingin disewa. Produk yang tidak dipilih akan tetap tersimpan di keranjang.
          </p>
        </div>

        {items.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="text-5xl" aria-hidden="true">🧺</span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Keranjang masih kosong</h2>
            <p className="mt-2 text-slate-500">Pilih perlengkapan camping untuk memulai penyewaan.</p>
            <Link to="/" className="mt-6 inline-flex rounded-full bg-emerald-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-900">
              Lihat perlengkapan
            </Link>
          </section>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-4">
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={selectedItems.length === items.length}
                  onChange={(event) => {
                    setSelectedItemIds(event.target.checked ? items.map((item) => item.id) : []);
                    setErrorMessage("");
                  }}
                  className="h-4 w-4 rounded border-slate-300 accent-emerald-700"
                />
                Pilih semua ({selectedItems.length}/{items.length})
              </label>
              {items.map((item) => (
                <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                  <img
                    src={item.image || "/welcome-image.png"}
                    alt={item.name}
                    className="h-36 w-full rounded-xl bg-slate-100 object-cover sm:h-28 sm:w-36"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={(event) => {
                          setSelectedItemIds((current) =>
                            event.target.checked
                              ? [...current, item.id]
                              : current.filter((id) => id !== item.id)
                          );
                          setErrorMessage("");
                        }}
                        aria-label={`Pilih ${item.name} untuk disewa`}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-emerald-700"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{item.category?.join(", ")}</p>
                        <h2 className="mt-1 truncate text-lg font-bold text-slate-900">{item.name}</h2>
                      </div>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {formatRupiah(item.price)} <span className="font-normal text-slate-400">/ unit / hari</span>
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        Jumlah
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={Number(item.quantity) || 1}
                          onChange={(event) => dispatch(setItemQuantity({ id: item.id, quantity: event.target.value }))}
                          className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-center text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(removeItem(item));
                          setSelectedItemIds((current) => current.filter((id) => id !== item.id));
                        }}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Detail penyewaan</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="delivery-address" className="mb-1.5 block text-sm font-semibold text-slate-700">Alamat pengiriman</label>
                  <textarea
                    id="delivery-address"
                    rows="3"
                    maxLength="500"
                    required
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Nama jalan, nomor rumah, kota..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="start-date" className="mb-1.5 block text-sm font-semibold text-slate-700">Mulai sewa</label>
                    <input
                      id="start-date"
                      type="date"
                      min={today}
                      required
                      value={startDate}
                      onChange={(event) => {
                        setStartDate(event.target.value);
                        if (endDate && event.target.value > endDate) setEndDate("");
                      }}
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="end-date" className="mb-1.5 block text-sm font-semibold text-slate-700">Kembali</label>
                    <input
                      id="end-date"
                      type="date"
                      min={startDate || today}
                      required
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Lama sewa</span>
                  <span className="font-semibold text-slate-800">{rentalDays ? `${rentalDays} hari` : "Pilih tanggal"}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{selectedItems.length} jenis dipilih</span>
                  <span>{selectedItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)} unit</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-4 text-base font-bold text-slate-900">
                  <span>Estimasi total</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Total hanya menghitung produk terpilih. Produk lainnya tetap di keranjang. Tanggal mulai dan kembali sama-sama dihitung sebagai hari sewa; stok dicek server untuk jadwal tersebut.
              </p>
              {errorMessage && (
                <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Menyimpan pesanan..."
                  : isLoggedIn()
                    ? "Kirim permohonan sewa"
                    : "Masuk untuk memesan"}
              </button>
            </section>
          </form>
        )}
      </div>
    </main>
  );
};

export default Cart;
