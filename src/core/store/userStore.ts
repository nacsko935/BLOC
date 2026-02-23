import { create } from "zustand";

type User = {
  id: string;
  name: string;
  handle: string;
  bio?: string | null;
  campus?: string | null;
  level?: number;
};

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
