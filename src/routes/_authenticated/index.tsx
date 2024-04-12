import { createFileRoute } from "@tanstack/react-router";
import { useLoggedInUser } from "../../hooks/useLoggedInUser";

export const Route = createFileRoute("/_authenticated/")({
  component: () => <Index />,
});

const Index = () => {
  const { user, userProfile } = useLoggedInUser();

  console.log();
  

  return (
    <div>
      <h1>{user && user.id}</h1>
      <h2>{userProfile && userProfile.name}</h2>
    </div>
  );
};
