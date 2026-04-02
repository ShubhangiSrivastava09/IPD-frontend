import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { CSidebar, CSidebarBrand, CSidebarHeader } from "@coreui/react";
import { AppSidebarNav } from "./AppSidebarNav";
import logo from "../assets/ipd-logo.png";
import useNav from "../_nav";

const AppSidebar = () => {
  const navigation = useNav();
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);

  return (
    <CSidebar
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) =>
        dispatch({ type: "set", sidebarShow: visible })
      }
      style={{
        top: 0,
        left: 0,
        minHeight: "100vh",
        width: "250px",
        zIndex: 1031,
        overflowY: "auto",
        backgroundColor: "#042954",
        
      }}
    >
      {/* Logo */}
      <CSidebarHeader
        style={{
          backgroundColor: "#042954",
          padding: "20px 16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            height: "80px",
            backgroundColor: "#fff",
            borderRadius: "6px",
            padding: "4px 8px",
            display: "block",
          }}
        />
      </CSidebarHeader>

      {/* Nav items */}
      {Array.isArray(navigation) && navigation.length > 0 && (
        <AppSidebarNav items={navigation} />
      )}
    </CSidebar>
  );
};

export default React.memo(AppSidebar);
