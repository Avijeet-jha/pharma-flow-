import { Navigate } from "react-router-dom";

type Role =
  | "SUPER_ADMIN"
  | "PHARMA"
  | "WHOLESALER"
  | "RETAILER";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  // No login information
  if (!token || !userString) {
    return <Navigate to="/" replace />;
  }

  let user;

  try {
    user = JSON.parse(userString);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/" replace />;
  }

  // Check role
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    switch (user.role) {
      case "SUPER_ADMIN":
        return <Navigate to="/admin" replace />;

      case "PHARMA":
        return <Navigate to="/pharma" replace />;

      case "WHOLESALER":
        return <Navigate to="/wholesaler" replace />;

      case "RETAILER":
        return <Navigate to="/retailer" replace />;

      default:
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;