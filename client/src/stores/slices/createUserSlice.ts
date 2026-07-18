// src/store/slices/createUserSlice.ts
import { StateCreator } from "zustand";

export interface UserSlice {
  user: any | null; 
  setUser: (user: any) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
});
