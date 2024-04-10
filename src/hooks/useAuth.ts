import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";

const SESSION_KEY = "supabase.session";

export const useAuth = () => {
  const localSessionStr = localStorage.getItem(SESSION_KEY);
  const localSession = localSessionStr
    ? JSON.parse(localSessionStr)
    : (null as Session | null);

  const [session, setSession] = useState<Session | null>(localSession);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setSession(session);
      } else {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    setSession(null);
    await supabase.auth.signOut();
    localStorage.removeItem(SESSION_KEY);
  };

  const signInByPhone = async (phoneNumber: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    if (error) {
      throw error;
    }
  };

  const verifyOtp = async (phoneNumber: string, verificationCode: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: verificationCode,
      type: "sms",
    });

    if (error) {
      throw error;
    }
  };

  return { session, logout, signInByPhone, verifyOtp };
};
