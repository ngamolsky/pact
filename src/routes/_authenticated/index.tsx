import { createFileRoute } from "@tanstack/react-router";
import { useLoggedInUser } from "../../hooks/useLoggedInUser";
import { useEffect, useState } from "react";
import { supabase } from "../../config/supabase";

export const Route = createFileRoute("/_authenticated/")({
  component: () => <Index />,
});

const Index = () => {
  const user = useLoggedInUser();

  const [profile, setProfile] = useState<{
    id: string;
    name: string;
    annualized_income: number;
  }>();
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        return;
      }

      try {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id);

        if (error) {
          throw error;
        }

        setProfile(profiles?.[0]);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchProfile();
  }, [user]);
  return (
    <div>
      <h1>{user && user.id}</h1>
      <h2>{profile && profile.name}</h2>
    </div>
  );
};
