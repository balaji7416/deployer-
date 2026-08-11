import { Routes, Route } from "react-router-dom";
import OverviewPage from "./pages/OverviewPage";
import DeploymentsPage from "./pages/DeploymentsPage";
import DeployPage from "./pages/DeployPage";
import AuthPage from "./pages/AuthPage";
import DeploymentDetailPage from "./pages/DeploymentDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<OverviewPage />} />
        <Route path="/deployments" element={<DeploymentsPage />} />
        <Route path="/deploy" element={<DeployPage />} />
        <Route path="/deployments/:id" element={<DeploymentDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
