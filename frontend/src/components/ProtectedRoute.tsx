import { useEffect } from "react";
import { useAuth } from "@/context/auth/useAuth";
import { useNavigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authChecking, checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !user) {
      navigate("/auth");
    } else if (!user && !authChecking) {
      checkAuth();
    }
  }, [user, authChecking, checkAuth, navigate]);

  if (authChecking || (!user && localStorage.getItem("token"))) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-600 border-t-blue-500" />
          <p className="text-sm font-mono">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user && !localStorage.getItem("token")) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
