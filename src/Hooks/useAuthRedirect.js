import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("IPD");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);
};

export default useAuthRedirect;
