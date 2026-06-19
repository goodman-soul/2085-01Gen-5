import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Login } from "@/pages/Login";
import { Employee } from "@/pages/Employee";
import { Dashboard } from "@/pages/Dashboard";
import { Summary } from "@/pages/Summary";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSupervisor?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireSupervisor = false }) => {
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireSupervisor && !currentUser.isSupervisor) {
    return <Navigate to="/employee" replace />;
  }

  if (!requireSupervisor && currentUser.isSupervisor) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  const init = useStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <Employee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireSupervisor>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <ProtectedRoute requireSupervisor>
              <Summary />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
