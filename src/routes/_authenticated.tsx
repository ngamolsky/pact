import {
  Navigate,
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location, context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
        search: {
          next: location.pathname === "/" ? undefined : location.pathname,
        },
      });
    }
  },

  component: () => <AuthComponent />,
});

const AuthComponent = () => {
  const { logout, session } = useContext(AuthContext);

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  if (!session) {
    return (
      <Navigate
        to="/login"
        search={currentPath !== "/" ? { next: currentPath } : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col inset-0">
      <header className=" text-white p-4 flex justify-end">
        <button className="text-white" onClick={logout}>
          Logout
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </div>
    </div>
  );
};
