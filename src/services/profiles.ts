import { supabase } from "../config/supabase";
import { Tables } from "../types/supabase";

export const updateProfile = async (
  value: Partial<Tables<"profiles">> & { id: string; phone: string },
) => {
  const { data, error } = await supabase.from("profiles").upsert([value]).eq(
    "id",
    value.id,
  ).select();

  if (error) {
    throw error;
  }
  return data && data[0];
};

export const getProfile = async (userID: string) => {
  const { data, error } = await supabase.from("profiles").select().eq(
    "id",
    userID,
  );

  if (error) {
    throw error;
  }
  return data && data[0];
};

export const getProfileByPhone = async (phone: string) => {
  const { data, error } = await supabase.from("profiles").select().eq(
    "phone",
    phone,
  );

  if (error) {
    throw error;
  }
  return data && data[0];
};
