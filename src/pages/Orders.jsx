import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api, { getErrorMessage } from "../api";

const STATUS = {
  pending: { label: "Menunggu persetujuan", style: "bg-amber-100 text-amber-800" },
  approved: { label: "Disetujui", style: "bg-blue-100 text-blue-800" },
  borrowed: { label: "Sedang dipinjam", style: "bg-violet-100 text-violet-800" },
  returned: { label: "Sudah dikembalikan", style: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Ditolak", style: "bg-red-100 text-red-800" },
  cancelled: { label: "Dibatalkan", style: "bg-slate-100 text-slate-700" },
};

const formatDate = (value) => {
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOrders = async () => {
    setErrorMessage("");
    try {
      const { data } = await api.get("/orders/my");
      setOrders(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Gagal memuat riwayat pesanan."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Pesanan Saya";
    loadOrders();
  }, []);

  const cancelOrder = async (order) => {
    const result = await Swal.fire({
      title: "Batalkan permohonan?",
      text: "Stok untuk jadwal ini akan dilepas kembali.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, batalkan",
      cancelButtonText: "Kembali",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await api.patch(`/orders/${order.id}/cancel`);
      await loadOrders();
      await Swal.fire({ icon: "success", title: "Pesanan dibatalkan", confirmButtonColor: "#047857" });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Pesanan gagal dibatalkan."));
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Riwayat penyewaan</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Pesanan saya</h1>
          <p className="mt-2 text-slate-500">Lihat status permohonan dan detail jadwal pinjam.</p>
        </div>

        {errorMessage && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
        )}
        {loading ? (
          <div className="rounded-2xl bg-white py-16 text-center text-slate-500">Memuat pesanan...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="text-5xl" aria-hidden="true">📋</span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Belum ada pesanan</h2>
            <p className="mt-2 text-slate-500">Permohonan penyewaan yang kamu kirim akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const status = STATUS[order.status] || STATUS.pending;
              return (
                <article key={order.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <p className="font-bold text-slate-900">Pesanan #{order.id}</p>
                      <p className="mt-1 text-xs text-slate-500">Diajukan {new Date(order.created_at).toLocaleString("id-ID")}</p>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${status.style}`}>{status.label}</span>
                  </div>
                  <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:p-6">
                    <div>
                      <div className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-slate-400">Jadwal peminjaman</p>
                          <p className="mt-1 font-semibold text-slate-800">{formatDate(order.start_date)} – {formatDate(order.end_date)} <span className="font-normal text-slate-500">({order.rental_days} hari)</span></p>
                        </div>
                        <div>
                          <p className="text-slate-400">Alamat pengiriman</p>
                          <p className="mt-1 font-medium text-slate-800">{order.delivery_address}</p>
                        </div>
                      </div>
                      <ul className="mt-4 divide-y divide-slate-100 rounded-xl bg-slate-50 px-4">
                        {order.items.map((item, index) => (
                          <li key={`${item.product_id || item.product_name}-${index}`} className="flex justify-between gap-3 py-3 text-sm">
                            <span className="text-slate-700">{item.product_name} <span className="text-slate-400">× {item.quantity}</span></span>
                            <span className="whitespace-nowrap font-medium text-slate-700">{formatRupiah(item.unit_price * item.quantity * order.rental_days)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:min-w-44 sm:flex-col sm:items-end sm:justify-start sm:border-0 sm:pt-0">
                      <div className="sm:text-right">
                        <p className="text-xs text-slate-400">Total sewa</p>
                        <p className="mt-1 text-lg font-black text-emerald-800">{formatRupiah(order.total_amount)}</p>
                      </div>
                      {order.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => cancelOrder(order)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Orders;
