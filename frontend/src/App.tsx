import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Deployments from "./pages/Deployments";
import DeployPage from "./pages/DeployPage";
import AuthPage from "./pages/AuthPage";
import Deployment from "./pages/Deployment";
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/deployments" element={<Deployments />} />
        <Route path="/deploy" element={<DeployPage />} />
        <Route path="/deployment/:id" element={<Deployment />} />
      </Route>
    </Routes>
  );
}

export default App;
