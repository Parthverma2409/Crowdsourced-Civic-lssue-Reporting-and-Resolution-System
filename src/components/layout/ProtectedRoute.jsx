import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../lib/constants";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirectMap = {
      [ROLES.ADMIN]: "/admin/dashboard",
      [ROLES.WORKER]: "/worker/dashboard",
      [ROLES.HELPER]: "/helper/home",
    };
    return <Navigate to={redirectMap[role] || "/"} replace />;
  }

  return children;
}
