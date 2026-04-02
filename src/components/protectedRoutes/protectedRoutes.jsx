import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../Context/AppContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AppContext);

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Role restriction (if passed)
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
