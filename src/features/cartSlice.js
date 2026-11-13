import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action) {
      const quantity = Number(action.payload.quantity) || 1;
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.quantity = (Number(existing.quantity) || 1) + quantity;
      } else {
        state.items.push({ ...action.payload, quantity });
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
    },
    setItemQuantity(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (item) item.quantity = Math.max(1, Number(action.payload.quantity) || 1);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, setItemQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
