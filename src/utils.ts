import { Tables } from "./types/supabase";

export const isProfileComplete = (profile: Tables<"profiles">): boolean => {
  return profile.annualized_income !== null && profile.name !== null;
};
