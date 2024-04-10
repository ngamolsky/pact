import { FC } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./config/router";
import { useAuth } from "./hooks/useAuth";
import { AuthContext } from "./contexts/AuthContext";

export const App: FC = () => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      <RouterProvider router={router} context={auth} />
    </AuthContext.Provider>
  );
};
