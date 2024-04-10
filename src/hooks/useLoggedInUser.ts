import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const useLoggedInUser = () => {
  const { session } = useContext(AuthContext);

  if (!session) {
    throw new Error(
      "useLoggedInUser must be used within an AuthProvider and signed in"
    );
  }

  const { user } = session;

  return user;
};
