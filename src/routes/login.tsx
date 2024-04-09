import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "../config/supabase";
import { FC, useContext, useEffect, useState } from "react";
import { router } from "../config/router";
import { AuthContext } from "../contexts/AuthContext";

export const Route = createFileRoute("/login")({
  component: () => <Login />,
  validateSearch: (search: { next?: string }) => {
    if (!search.next) {
      return {
        next: "/createAccount",
      };
    }

    return {
      next: search.next,
    };
  },
});

const Login: FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const session = useContext(AuthContext);

  useEffect(() => {
    if (session) {
      router.history.push("/createAccount");
    }
  }, [session]);

  const handlePhoneSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      const { message } = error as Error;
      setError(message);
    }
  };

  const handleVerification = async () => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: verificationCode,
        type: "sms",
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const { message } = error as Error;
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 w-full">
      <div className="max-w-md  bg-white p-8 rounded shadow-lg mx-auto">
        <h2 className="text-2xl mb-4">Phone Sign Up</h2>
        <input
          type="tel"
          placeholder="Phone Number"
          className="w-full border rounded p-2 mb-4"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-4"
          onClick={handlePhoneSignUp}
        >
          Send Verification Code
        </button>
        <input
          type="text"
          placeholder="Verification Code"
          className="w-full border rounded p-2 mb-4"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-4"
          onClick={handleVerification}
        >
          Verify
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};