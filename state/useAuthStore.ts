import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import {
  getSession,
  onAuthStateChange,
  signIn as signInService,
  signOut as signOutService,
  signUp as signUpService,
} from "../lib/services/authService";
import { getMyProfile, upsertMyProfile } from "../lib/services/profileService";
import { Profile } from "../types/db";

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  initAuth: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
};

let unsubscribeAuth: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initAuth: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const session = await getSession();
      const user = session?.user ?? null;
      const profile = user ? await getMyProfile().catch(() => null) : null;
      set({ session, user, profile, loading: false, initialized: true });

      if (!unsubscribeAuth) {
        unsubscribeAuth = onAuthStateChange(async (nextSession) => {
          const nextUser = nextSession?.user ?? null;
          const nextProfile = nextUser ? await getMyProfile().catch(() => null) : null;
          set({ session: nextSession, user: nextUser, profile: nextProfile, loading: false, initialized: true });
        });
      }
    } catch {
      set({ session: null, user: null, profile: null, loading: false, initialized: true });
    }
  },

  signUp: async (email, password) => {
    await signUpService(email, password);
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      await signInService(email, password);
      const session = await getSession();
      const user = session?.user ?? null;
      const profile = user ? await getMyProfile().catch(() => null) : null;
      set({ session, user, profile, loading: false, initialized: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    await signOutService();
    set({ session: null, user: null, profile: null, loading: false, initialized: true });
  },

  updateProfile: async (patch) => {
    const profile = await upsertMyProfile(patch);
    set({ profile });
  },
}));
