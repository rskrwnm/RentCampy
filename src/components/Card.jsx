const CATEGORY_STYLE = {
  Tenda: "bg-green-100 text-green-700",
  "Alat Tidur": "bg-blue-100 text-blue-700",
  "Peralatan Masak": "bg-orange-100 text-orange-700",
};

const Card = ({
  id,
  name,
  category,
  price,
  stock,
  image,
  handleNavigateDetails,
  handleAddtoCart,
  showCartButton,
}) => {
  return (
    <div
      id={id}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-stone-100 via-white to-emerald-50">
        <img
          src={image || "/welcome-image.png"}
          alt={name}
          onClick={handleNavigateDetails}
          loading="lazy"
          decoding="async"
          className="h-full w-full cursor-pointer object-contain p-4 transition duration-300 group-hover:scale-[1.03] sm:p-5"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {(Array.isArray(category) ? category : []).map((cat) => (
            <span
              key={cat}
              className={`rounded-full px-3 py-1 text-xs font-semibold shadow ${
                CATEGORY_STYLE[cat] || "bg-gray-100 text-gray-700"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
        {Number.isFinite(Number(stock)) && (
          <span
            className={`absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
              stock > 0
                ? "bg-white/95 text-emerald-800"
                : "bg-slate-900/80 text-white"
            }`}
          >
            {stock > 0 ? `${stock} tersedia` : "Stok habis"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="mb-1 line-clamp-2 min-h-14 text-lg font-semibold text-gray-800">{name}</h2>
        <p className="mb-4 text-lg font-bold text-emerald-700">
          Rp {Number(price).toLocaleString("id-ID")}
          <span className="text-sm font-normal text-gray-400"> / hari</span>
        </p>

        {showCartButton && (
          <div className="mt-auto grid grid-cols-2 gap-2">
            <button
              onClick={handleNavigateDetails}
              className="rounded-lg border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              Detail
            </button>
            <button
              onClick={handleAddtoCart}
              disabled={Number.isFinite(Number(stock)) && stock < 1}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {Number.isFinite(Number(stock)) && stock < 1 ? "Stok habis" : "+ Keranjang"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
