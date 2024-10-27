import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";
import { act } from "react";

export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      // 성공
      // Loginpage
      // 토큰 저장
      sessionStorage.setItem("token", response.data.token);
      return response.data;
    } catch (e) {
      // 실패
      // 실패시 생긴 에러값을 reducer에 저장
      return rejectWithValue(e.message);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {}
);

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (
    { email, name, password, navigate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.post("/user", { email, name, password });
      // 성공
      // 1. 성공 토스트 메시지 보여주기
      dispatch(
        showToastMessage({
          message: "회원가입에 성공했습니다!",
          status: "success",
        })
      );
      // 2. 로그인 페이지 리다이렉트
      navigate("/login");
      return response.data.data;
    } catch (e) {
      // 실패
      // 1. 실패 토스트 메시지 보여주기
      dispatch(
        showToastMessage({
          message: "회원가입에 실패했습니다.",
          status: "error",
        })
      );
      // 2. 에러값 저장
      return rejectWithValue(e.message);
    }
  }
);

export const loginWithToken = createAsyncThunk(
  "user/loginWithToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/me");
      return response.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      sessionStorage.removeItem("token");
      dispatch(
        showToastMessage({
          message: "로그아웃 되었습니다.",
          status: "success",
        })
      );
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // register 리듀서
      .addCase(registerUser.pending, (state) => {
        // 로딩중
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        // 성공
        state.loading = false;
        state.registrationError = null;
        state.success = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        // 실패
        state.loading = false;
        state.registrationError = action.payload;
      })
      // email login 리듀서
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // action.payload = {success, token, user{_id, email, name, level} }
        state.loginError = null;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
      // token login 리듀서
      .addCase(loginWithToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      // logout 리듀서
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.success = false;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
      });
  },
});
export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
