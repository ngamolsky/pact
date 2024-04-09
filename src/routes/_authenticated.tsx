import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "../config/supabase";
import { router } from "../config/router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location, context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
        search: {
          next: location.pathname,
        },
      });
    }
  },
  component: () => <AuthComponent />,
});

const AuthComponent = () => {
  const session = useContext(AuthContext);

  useEffect(() => {
    if (!session) {
      const currentPath = router.parseLocation().pathname;
      router.navigate({
        to: "/login",
        search: {
          next: currentPath,
        },
      });
    }
  }, [session]);

  return (
    <div>
      <button
        onClick={() => {
          supabase.auth.signOut();
        }}
      >
        Log Out
      </button>
      <Outlet />
    </div>
  );
};
