import { SignIn } from "@clerk/clerk-react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { ROLES } from "../lib/constants";

export default function Login() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user && role) {
    const redirectMap = {
      [ROLES.ADMIN]: "/admin/dashboard",
      [ROLES.WORKER]: "/worker/dashboard",
      [ROLES.HELPER]: "/helper/home",
    };
    return <Navigate to={redirectMap[role] || "/helper/home"} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">CivicSense</h1>
          <p className="mt-2 text-gray-600">
            Report civic issues. Build better communities.
          </p>
        </div>
        <SignIn
          routing="hash"
          signUpUrl="/signup"
          afterSignInUrl="/"
        />
      </div>
    </div>
  );
}
