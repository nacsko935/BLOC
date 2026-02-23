import AsyncStorage from "@react-native-async-storage/async-storage";

export type OnboardingProfile = {
  school: string;
  track: string;
  level: string;
  goals: string[];
  completedAt: string;
};

const ONBOARDING_KEY = "bloc.onboarding.profile";

export async function getOnboardingProfile(): Promise<OnboardingProfile | null> {
  const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingProfile;
  } catch {
    return null;
  }
}

export async function saveOnboardingProfile(profile: Omit<OnboardingProfile, "completedAt">) {
  const payload: OnboardingProfile = { ...profile, completedAt: new Date().toISOString() };
  await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(payload));
  return payload;
}

export async function isOnboardingComplete() {
  const profile = await getOnboardingProfile();
  return !!profile;
}
