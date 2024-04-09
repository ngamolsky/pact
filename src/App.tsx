import { FC, useEffect, useState } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./config/router";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./config/supabase";
import { AuthContext } from "./contexts/AuthContext";

const SESSION_KEY = "supabase.session";

export const App: FC = () => {
  const localSessionStr = localStorage.getItem(SESSION_KEY);
  const localSession = localSessionStr
    ? JSON.parse(localSessionStr)
    : (null as Session | null);

  const [session, setSession] = useState<Session | null>(localSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={session}>
      <RouterProvider
        router={router}
        context={{
          session,
        }}
      />
    </AuthContext.Provider>
  );
};
