import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { AuthContextType } from "../contexts/AuthContext";

export const Route = createRootRouteWithContext<AuthContextType>()({
  component: () => <Root />,
});

const Root = () => {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
};
