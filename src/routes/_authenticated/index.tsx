import { createFileRoute } from "@tanstack/react-router";
import { useLoggedInUser } from "../../hooks/useLoggedInUser";
import { getProfile } from "../../services/profiles";

export const Route = createFileRoute("/_authenticated/")({
  component: () => <Index />,
  loader: async ({ context }) => {
    const profile = await getProfile(context.session!.user.id);
    return { profile };
  },
});

const Index = () => {
  const { user } = useLoggedInUser();
  const { profile: userProfile } = Route.useLoaderData();

  console.log();

  return (
    <div className="m-4 p-4 bg-white shadow-lg rounded-lg flex flex-col justify-between">
      <h1 className="text-2xl font-bold">Welcome back, {user?.phone}!</h1>
      <p>Your profile:</p>
      <p>{JSON.stringify(userProfile, null, 2)}</p>
    </div>
  );
};
