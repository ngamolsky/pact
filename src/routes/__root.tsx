import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { AuthContextType } from "../contexts/AuthContext";

export const Route = createRootRouteWithContext<AuthContextType>()({
  component: () => <Root />,
});

const Root = () => {
  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center w-full bg-gradient-blue">
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  );
};
