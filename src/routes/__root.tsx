import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { AuthContextType } from "../contexts/AuthContext";

export const Route = createRootRouteWithContext<AuthContextType>()({
  component: () => <Root />,
});

const Root = () => {
  return (
    <div className="absolute inset-0 flex flex-col w-full bg-gradient-blue">
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  );
};
