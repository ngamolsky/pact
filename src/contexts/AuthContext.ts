import { createContext } from "react";
import { Session } from "@supabase/supabase-js";
import { Tables } from "../types/supabase";

export type AuthContextType = {
  session: Session | null;
  userProfile: Tables<"profiles"> | null;
  logout: () => Promise<void>;
  verifyOtp: (phoneNumber: string, verificationCode: string) => Promise<void>;
  signInByPhone: (phoneNumber: string) => Promise<void>;
  setUserProfile: (profile: Tables<"profiles">) => void;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  userProfile: null,
  logout() {
    throw new Error("logout() not implemented");
  },
  verifyOtp() {
    throw new Error("verifyOtp() not implemented");
  },
  signInByPhone() {
    throw new Error("signInByPhone() not implemented");
  },
  setUserProfile() {
    throw new Error("setUserProfile() not implemented");
  },
});
