import { StateCreator } from "zustand";

export type AiStatus = "IDLE" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface AiSlice {
    aiStatus: AiStatus;
    aiReport: string | null;
    setAiStatus: (status: AiStatus) => void;
    setAiReport: (report: string | null) => void;
}

export const createAiSlice: StateCreator<AiSlice> = (set) => ({
    aiStatus: "IDLE",
    aiReport: null,
    setAiStatus: (status) => set({ aiStatus: status }),
    setAiReport: (report) => set({ aiReport: report }),
});
