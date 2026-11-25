import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) return <p className="status">Checking session...</p>;
  if (user) return <Navigate to="/profile" replace />;

  return <Outlet />;
}