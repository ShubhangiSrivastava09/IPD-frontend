src / layout / DefaultLayout.jsx;
import React, { useEffect, useState, useContext } from "react";
import Cookies from "js-cookie";

import { AppContent, AppSidebar, AppFooter, AppHeader } from "../components";
import { getRequest } from "../Helpers";
import { useNavigate } from "react-router-dom";
import { deleteCookie } from "../Hooks/cookie";
import { AppContext } from "../Context/AppContext";
import { useRoles } from "../Context/AuthContext";
import { useSelector } from "react-redux";
import useAuthRedirect from "../Hooks/useAuthRedirect";

const DefaultLayout = () => {
  useAuthRedirect();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const { setRole } = useRoles();
  const { setUser } = useContext(AppContext);
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const [loading, setLoading] = useState(true);

  const sidebarWidth = !sidebarShow ? 0 : unfoldable ? 56 : 256;

  useEffect(() => {
    const savedUser = localStorage.getItem("IPD");
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    setUserData(parsedUser);

    const token = Cookies.get("IPD");

    if (!token) {
      setLoading(false);
      return;
    }

    getRequest("users/me")
      .then((res) => {
        const profile = res?.data?.data;
        setUser(profile);
        setRole(profile?.role);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          deleteCookie("IPD");
          deleteCookie("UserId");
          navigate("/login");
        } else {
          console.error("API Error:", error);
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, setUser, setRole]);

  if (loading) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5" }}>
      <AppSidebar userData={userData} />

      <div
        style={{
          // marginLeft: sidebarWidth,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
          minWidth: 0,
        }}
      >
        <AppHeader userData={userData} />

        <div style={{ flex: 1, padding: "0px", overflowY: "auto" }}>
          <AppContent userData={userData} />
        </div>

        <AppFooter userData={userData} />
      </div>
    </div>
  );
};

export default DefaultLayout;
