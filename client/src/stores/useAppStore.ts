// src/store/useAppStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createAuthSlice, AuthSlice } from "./slices/createAuthSlice";
import { createUserSlice, UserSlice } from "./slices/createUserSlice";
import { createAiSlice, AiSlice } from "./slices/createAiSlice";

type AppState = AuthSlice & UserSlice & AiSlice;

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createUserSlice(...a),
        ...createAiSlice(...a),
      }),
      {
        name: "app-storage",
        partialize: (state) => ({ 
          token: state.token, 
          user: state.user,
          isAuthenticated: state.isAuthenticated 
        }),
      },
    ),
  ),
);
