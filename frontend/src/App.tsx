import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Deployments from "./pages/Deployments";
import DeployPage from "./pages/DeployPage";

import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deployments" element={<Deployments />} />
          <Route path="/deploy" element={<DeployPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
