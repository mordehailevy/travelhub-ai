import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { VacationsPage } from "./pages/VacationsPage";
import { AiRecommendationPage } from "./pages/AiRecommendationPage";
import { McpChatPage } from "./pages/McpChatPage";
import { AdminVacationsPage } from "./pages/AdminVacationsPage";
import { AddVacationPage } from "./pages/AddVacationPage";
import { EditVacationPage } from "./pages/EditVacationPage";
import { ReportPage } from "./pages/ReportPage";
import { AboutPage } from "./pages/AboutPage";

function HomeRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? "/admin" : "/vacations"} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/vacations" element={<VacationsPage />} />
              <Route path="/ai-recommendation" element={<AiRecommendationPage />} />
              <Route path="/ask" element={<McpChatPage />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminVacationsPage />} />
              <Route path="/admin/vacations/new" element={<AddVacationPage />} />
              <Route path="/admin/vacations/:id/edit" element={<EditVacationPage />} />
              <Route path="/admin/report" element={<ReportPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
