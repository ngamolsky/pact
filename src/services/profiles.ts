import { supabase } from "../config/supabase";
import { Tables } from "../types/supabase";

export const updateProfile = async (
  userID: string,
  value: Partial<Tables<"profiles">>,
) => {
  const { data, error } = await supabase.from("profiles").update(value).eq(
    "id",
    userID,
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
