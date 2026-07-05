import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { VacationsPage } from "./pages/VacationsPage";
import { AiRecommendationPage } from "./pages/AiRecommendationPage";
import { McpChatPage } from "./pages/McpChatPage";
import { ProfilPage } from "./pages/ProfilPage";
import { AboutPage } from "./pages/AboutPage";
import { Skeleton } from "@/components/ui/skeleton";

// Admin-only surfaces (incl. the recharts-based report) are lazy-loaded:
// they're the least-visited routes for the traveler persona, so deferring
// them keeps the main bundle lighter for everyone else.
const AdminVacationsPage = lazy(() =>
  import("./pages/AdminVacationsPage").then((m) => ({ default: m.AdminVacationsPage }))
);
const AddVacationPage = lazy(() => import("./pages/AddVacationPage").then((m) => ({ default: m.AddVacationPage })));
const EditVacationPage = lazy(() =>
  import("./pages/EditVacationPage").then((m) => ({ default: m.EditVacationPage }))
);
const ReportPage = lazy(() => import("./pages/ReportPage").then((m) => ({ default: m.ReportPage })));

function AdminPageFallback() {
  return <Skeleton className="h-96 w-full rounded-xl" />;
}

function HomeRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <LandingPage />;
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
              <Route path="/profil" element={<ProfilPage />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<AdminPageFallback />}>
                    <AdminVacationsPage />
                  </Suspense>
                }
              />
              <Route
                path="/admin/vacations/new"
                element={
                  <Suspense fallback={<AdminPageFallback />}>
                    <AddVacationPage />
                  </Suspense>
                }
              />
              <Route
                path="/admin/vacations/:id/edit"
                element={
                  <Suspense fallback={<AdminPageFallback />}>
                    <EditVacationPage />
                  </Suspense>
                }
              />
              <Route
                path="/admin/report"
                element={
                  <Suspense fallback={<AdminPageFallback />}>
                    <ReportPage />
                  </Suspense>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
