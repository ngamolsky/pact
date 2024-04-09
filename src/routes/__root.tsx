import { Session } from "@supabase/supabase-js";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

type AuthContext = {
  session: Session | null;
};

export const Route = createRootRouteWithContext<AuthContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
