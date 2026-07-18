// src/store/useAppStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createAuthSlice, AuthSlice } from "./slices/createAuthSlice";
import { createUserSlice, UserSlice } from "./slices/createUserSlice";

type AppState = AuthSlice & UserSlice;

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createUserSlice(...a),
      }),
      {
        name: "app-storage",
        // Chọn lọc những thứ cần lưu (Ví dụ chỉ lưu token và user, không lưu loading state)
        partialize: (state) => ({ token: state.token, user: state.user }),
      },
    ),
  ),
);
