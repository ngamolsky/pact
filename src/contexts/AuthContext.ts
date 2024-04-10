import { createContext } from "react";
import { Session } from "@supabase/supabase-js";

export type AuthContextType = {
  session: Session | null;
  logout: () => Promise<void>;
  verifyOtp: (phoneNumber: string, verificationCode: string) => Promise<void>;
  signInByPhone: (phoneNumber: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  logout() {
    throw new Error("logout() not implemented");
  },
  verifyOtp() {
    throw new Error("verifyOtp() not implemented");
  },
  signInByPhone() {
    throw new Error("signInByPhone() not implemented");
  },
});
