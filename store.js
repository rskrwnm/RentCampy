import { configureStore } from "@reduxjs/toolkit";

import cartSlice from "./src/features/cartSlice";

const CART_STORAGE_KEY = "rentcampy_cart";

const loadCart = () => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return { items: [] };

    const parsedCart = JSON.parse(storedCart);
    if (!Array.isArray(parsedCart.items)) {
      throw new Error("Format data keranjang tidak valid.");
    }

    return { items: parsedCart.items };
  } catch (error) {
    console.error("Keranjang tersimpan gagal dimuat:", error);
    return { items: [] };
  }
};

const store = configureStore({
  reducer: {
    cart: cartSlice,
  },
  preloadedState: {
    cart: loadCart(),
  },
});

store.subscribe(() => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(store.getState().cart));
  } catch (error) {
    console.error("Perubahan keranjang gagal disimpan:", error);
  }
});

export default store;
