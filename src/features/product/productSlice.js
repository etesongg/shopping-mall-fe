import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

// 비동기 액션 생성
export const getProductList = createAsyncThunk(
  "products/getProductList",
  async (query, { getState }) => {
    const { itemsPerPage } = getState().product;
    const response = await api.get("/product", {
      params: { ...query, itemsPerPage: query.itemsPerPage || itemsPerPage },
    });
    return { ...response.data, query };
  }
);

export const getProductDetail = createAsyncThunk(
  "products/getProductDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${id}`);

      return response.data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await api.post("/product", formData);
      const { itemsPerPage } = getState().product;
      dispatch(
        showToastMessage({
          message: "상품 생성 완료!",
          status: "success",
        })
      );
      // 페이지를 1로 리셋하고 상품 목록을 다시 가져옴
      dispatch(getProductList({ page: 1, itemsPerPage }));
      return { ...response.data.data, resetPage: true };
    } catch (e) {
      const eMessage = e.message.includes("E11000")
        ? "Sku already exists."
        : e.message;
      return rejectWithValue(eMessage);
    }
  }
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, ...formData }, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await api.put(`/product/${id}`, formData);
      const { itemsPerPage, currentPage } = getState().product;
      dispatch(
        showToastMessage({
          message: "상품 수정 완료!",
          status: "success",
        })
      );
      dispatch(getProductList({ page: currentPage, itemsPerPage }));
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await api.delete(`/product/${id}`);
      const { itemsPerPage, currentPage } = getState().product;
      dispatch(
        showToastMessage({
          message: "상품 삭제 완료!",
          status: "success",
        })
      );
      dispatch(getProductList({ page: currentPage, itemsPerPage }));
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// 슬라이스 생성
const productSlice = createSlice({
  name: "products",
  initialState: {
    productList: [],
    selectedProduct: null,
    loading: false,
    error: "",
    totalPageNum: 1,
    success: false,
    itemsPerPage: 5,
    currentPage: 1,
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setFilteredList: (state, action) => {
      state.filteredList = action.payload;
    },
    clearError: (state) => {
      state.error = "";
      state.success = false;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 상품 생성
      .addCase(createProduct.pending, (state, action) => {
        // 로딩중
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        // 성공
        state.loading = false;
        state.error = "";
        state.success = true; // 상품생성을 성공했으면 dialog를 닫고, 실패했으면 dialog에 보여주고 닫진 않음
        if (action.payload.resetPage) {
          state.currentPage = 1;
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        // 실패
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // 상품 리스트
      .addCase(getProductList.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getProductList.fulfilled, (state, action) => {
        state.loading = false;
        state.productList = action.payload.data;
        state.error = "";
        state.totalPageNum = action.payload.totalPageNum;
        state.currentPage = action.payload.query.page;
        state.itemsPerPage =
          action.payload.query.itemsPerPage || state.itemsPerPage;
      })
      .addCase(getProductList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // 상품 수정
      .addCase(editProduct.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.success = true;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // 상품 삭제
      .addCase(deleteProduct.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.success = true;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // 상품 디테일
      .addCase(getProductDetail.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getProductDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.success = true;
        state.selectedProduct = action.payload;
      })
      .addCase(getProductDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  setSelectedProduct,
  setFilteredList,
  clearError,
  setItemsPerPage,
  setCurrentPage,
} = productSlice.actions;
export default productSlice.reducer;
