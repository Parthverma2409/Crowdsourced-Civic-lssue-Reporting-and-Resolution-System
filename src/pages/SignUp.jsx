import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function SignUp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">CivicSense</h1>
          <p className="mt-2 text-gray-600">
            Join your community. Start reporting issues.
          </p>
        </div>
        <ClerkSignUp
          routing="hash"
          signInUrl="/login"
          afterSignUpUrl="/"
        />
      </div>
    </div>
  );
}
