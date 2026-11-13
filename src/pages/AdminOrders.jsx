import { useEffect, useMemo, useState } from "react";
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

const ACTIONS = {
  pending: [
    { status: "approved", label: "Setujui", style: "bg-emerald-700 text-white hover:bg-emerald-800" },
    { status: "rejected", label: "Tolak", style: "border border-red-200 text-red-700 hover:bg-red-50" },
  ],
  approved: [
    { status: "borrowed", label: "Tandai dipinjam", style: "bg-blue-700 text-white hover:bg-blue-800" },
  ],
  borrowed: [
    { status: "returned", label: "Tandai dikembalikan", style: "bg-emerald-700 text-white hover:bg-emerald-800" },
  ],
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");

  const loadOrders = async () => {
    setErrorMessage("");
    try {
      const { data } = await api.get("/admin/orders");
      setOrders(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Gagal memuat data peminjaman."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Kelola Peminjaman";
    loadOrders();
  }, []);

  const updateStatus = async (order, nextStatus) => {
    const action = ACTIONS[order.status]?.find((entry) => entry.status === nextStatus);
    if (!action) return;
    const result = await Swal.fire({
      title: `${action.label} pesanan #${order.id}?`,
      text: nextStatus === "rejected"
        ? "Permohonan ditolak dan stok yang dipesan akan dilepas."
        : nextStatus === "returned"
          ? "Pastikan barang sudah diterima kembali. Stok akan tersedia lagi untuk jadwal lain."
          : "Status pesanan akan diperbarui.",
      icon: nextStatus === "rejected" ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: action.label,
      cancelButtonText: "Batal",
      confirmButtonColor: nextStatus === "rejected" ? "#dc2626" : "#047857",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      const { data } = await api.patch(`/admin/orders/${order.id}/status`, { status: nextStatus });
      setOrders((current) => current.map((entry) =>
        entry.id === order.id ? { ...entry, ...data } : entry
      ));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Status peminjaman gagal diperbarui."));
    }
  };

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesSearch = !keyword ||
        order.user_email.toLowerCase().includes(keyword) ||
        String(order.id).includes(keyword) ||
        order.items.some((item) => item.product_name.toLowerCase().includes(keyword));
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);
  const borrowedOrders = useMemo(
    () => orders.filter((order) => order.status === "borrowed"),
    [orders]
  );

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Operasional</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Kelola Peminjaman</h1>
          <p className="mt-2 text-gray-500">Tinjau permohonan, lihat siapa yang meminjam, dan perbarui status pengembalian.</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Menunggu", orders.filter((order) => order.status === "pending").length, "text-amber-700"],
            ["Disetujui", orders.filter((order) => order.status === "approved").length, "text-blue-700"],
            ["Dipinjam", orders.filter((order) => order.status === "borrowed").length, "text-violet-700"],
            ["Selesai", orders.filter((order) => order.status === "returned").length, "text-emerald-700"],
          ].map(([label, count, color]) => (
            <div key={label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`mt-1 text-2xl font-black ${color}`}>{count}</p>
            </div>
          ))}
        </div>

        {errorMessage && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
        )}

        <section className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Barang sedang dipinjam</h2>
              <p className="mt-1 text-sm text-gray-500">Daftar barang yang sudah diserahkan kepada user.</p>
            </div>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
              {borrowedOrders.length} pesanan aktif
            </span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">Memuat daftar barang...</div>
          ) : borrowedOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
              Belum ada barang yang sedang dipinjam.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-3">Pesanan</th>
                    <th className="px-3 py-3">Peminjam</th>
                    <th className="px-3 py-3">Barang dipinjam</th>
                    <th className="px-3 py-3">Jadwal kembali</th>
                    <th className="px-3 py-3">Alamat</th>
                    <th className="px-3 py-3 text-right">Kontrol</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowedOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="whitespace-nowrap px-3 py-4 font-semibold text-gray-800">#{order.id}</td>
                      <td className="px-3 py-4 font-medium text-emerald-800">{order.user_email}</td>
                      <td className="px-3 py-4">
                        <ul className="space-y-1">
                          {order.items.map((item, index) => (
                            <li key={`${item.product_id || item.product_name}-${index}`} className="font-medium text-gray-800">
                              {item.product_name} <span className="font-normal text-gray-500">× {item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-gray-700">
                        <span className="block">{formatDate(order.start_date)}</span>
                        <span className="mt-1 block text-xs text-gray-500">Kembali {formatDate(order.end_date)}</span>
                      </td>
                      <td className="max-w-xs px-3 py-4 text-gray-600">{order.delivery_address}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => updateStatus(order, "returned")}
                          className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                        >
                          Tandai dikembalikan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-gray-900">Daftar pesanan <span className="font-normal text-gray-400">({filteredOrders.length})</span></h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari email, nomor, produk..."
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter status pesanan"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-600"
              >
                <option value="all">Semua status</option>
                {Object.entries(STATUS).map(([value, status]) => (
                  <option key={value} value={value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">Memuat daftar peminjaman...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-14 text-center text-gray-500">Belum ada pesanan pada filter ini.</div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const status = STATUS[order.status] || STATUS.pending;
                return (
                  <article key={order.id} className="rounded-xl border border-gray-200 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-gray-900">Pesanan #{order.id}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.style}`}>{status.label}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-emerald-800">{order.user_email}</p>
                        <p className="mt-1 text-xs text-gray-500">Diajukan {new Date(order.created_at).toLocaleString("id-ID")}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs text-gray-400">Total pesanan</p>
                        <p className="mt-1 text-lg font-black text-gray-900">{formatRupiah(order.total_amount)}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 py-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Jadwal sewa</p>
                        <p className="mt-1 font-medium text-gray-800">{formatDate(order.start_date)} – {formatDate(order.end_date)} ({order.rental_days} hari)</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Alamat pengiriman</p>
                        <p className="mt-1 text-gray-700">{order.delivery_address}</p>
                      </div>
                    </div>

                    <ul className="divide-y divide-gray-100 rounded-lg bg-gray-50 px-3">
                      {order.items.map((item, index) => (
                        <li key={`${item.product_id || item.product_name}-${index}`} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                          <span className="font-medium text-gray-800">{item.product_name} <span className="font-normal text-gray-500">× {item.quantity}</span></span>
                          <span className="text-gray-600">{formatRupiah(item.unit_price)} / unit / hari</span>
                        </li>
                      ))}
                    </ul>

                    {ACTIONS[order.status] && (
                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        {ACTIONS[order.status].map((action) => (
                          <button
                            key={action.status}
                            type="button"
                            onClick={() => updateStatus(order, action.status)}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${action.style}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminOrders;
