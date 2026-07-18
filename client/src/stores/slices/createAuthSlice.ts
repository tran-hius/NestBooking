import { StateCreator } from "zustand";

export interface AuthSlice {
    token: string | null;
    isAuthenticated: boolean
    setToken: (token: string) => void;
    clearAuth: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
    token: null,
    isAuthenticated: false,

    setToken: (token) => set({token, isAuthenticated: true}),
    clearAuth: () => set({token: null, isAuthenticated: false})
})