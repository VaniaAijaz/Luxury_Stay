import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  /* NOT LOGGED IN */

  if (!token) {
    return <Navigate to="/login" />;
  }

  /* ROLE CHECK */

  if (
    allowedRoles &&
    !allowedRoles.includes(user?.role)
  ) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;