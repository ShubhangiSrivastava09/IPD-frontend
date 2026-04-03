
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useContext } from "react";
import { AppContext } from "../../Context/AppContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AppContext);
  const token = Cookies.get("IPD");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
