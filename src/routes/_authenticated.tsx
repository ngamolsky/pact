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
    <div>
      <button
        onClick={() => {
          logout();
        }}
      >
        Log Out
      </button>
      <Outlet />
    </div>
  );
};
