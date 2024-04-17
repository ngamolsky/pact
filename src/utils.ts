import { Tables } from "./types/supabase";

export const isProfileComplete = (profile: Tables<"profiles">): boolean => {
  return profile.annualized_income !== null && profile.name !== null;
};

export const sanitizePhoneNumber = (phone: string) => {
  let sanitizedPhoneNumber = phone.replace(/\D/g, "");

  if (sanitizedPhoneNumber.length == 10) {
    sanitizedPhoneNumber = `1${sanitizedPhoneNumber}`;
  }

  return sanitizedPhoneNumber;
};

export const formatPhoneNumber = (phone: string) => {
  const cleanedPhone = phone.replace(/^1/, "").replace(
    /(\d{3})(\d{3})(\d{4})/,
    "($1) $2-$3",
  );
  return cleanedPhone.length === 10 ? `1${cleanedPhone}` : cleanedPhone;
};
