import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

const initialState = {
  loading: false,
  error: "",
  cartList: [],
  selectedItem: {},
  cartItemCount: 0,
  totalPrice: 0,
};

// Async thunk actions
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ id, size }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/cart", { productId: id, size, qty: 1 });
      if (response.status !== 200) throw new Error(response.message);
      dispatch(
        showToastMessage({
          message: "카트에 아이템이 추가 됐습니다.",
          status: "success",
        })
      );
      return response.data.cartItemQty;
    } catch (e) {
      dispatch(
        showToastMessage({
          message: e.message,
          status: "error",
        })
      );
      return rejectWithValue(e.message);
    }
  }
);

export const getCartList = createAsyncThunk(
  "cart/getCartList",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/cart");
      if (response.status !== 200) throw new Error(response.message);
      return response.data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.delete(`/cart/${id}`);
      if (response.status !== 200) throw new Error(response.message);
      dispatch(getCartList());
      return response.data.cartItemQty;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({ id, value }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/cart/${id}`, { qty: value });
      if (response.status !== 200) throw new Error(response.message);
      dispatch(getCartList());
      return response.data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const getCartQty = createAsyncThunk(
  "cart/getCartQty",
  async (_, { rejectWithValue, dispatch }) => {}
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initialCart: (state) => {
      state.cartItemCount = 0;
    },
    // You can still add reducers here for non-async actions if necessary
  },
  extraReducers: (builder) => {
    builder
      // 카트 상품 담기
      .addCase(addToCart.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartItemCount = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 카트 보여주기
      .addCase(getCartList.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getCartList.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartList = action.payload;
        state.totalPrice = action.payload.reduce(
          // 많은 곳에서 필요하기 때문에 각 필요한 페이지에서 계산해서 사용하는 것보다 한번 계산해서 가져가 쓰는 게 효율적
          (total, item) => total + item.productId.price * item.qty,
          0
        );
      })
      .addCase(getCartList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 카트 상품 삭제하기
      .addCase(deleteCartItem.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartItemCount = action.payload;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 카트 상품 갯수 수정하기
      .addCase(updateQty.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(updateQty.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
      })
      .addCase(updateQty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
export const { initialCart } = cartSlice.actions;
