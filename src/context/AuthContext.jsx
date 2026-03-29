import { createContext, useContext, useState, useEffect } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const { getToken } = useClerkAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!isClerkLoaded) return;

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
        } else {
          setRole("helper");
        }
      } catch {
        setRole("helper");
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user, isClerkLoaded, getToken]);

  const value = {
    user,
    role,
    loading: !isClerkLoaded || loading,
    isAuthenticated: !!user,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
