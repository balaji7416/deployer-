import { useAuth } from "@/context/auth/useAuth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();

  const user = localStorage.getItem("user");
  if (!user) {
    checkAuth();
  }
  return children;
}

export default ProtectedRoute;
