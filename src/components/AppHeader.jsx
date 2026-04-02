import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CHeader, CContainer, CHeaderNav, CHeaderToggler } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilMenu } from "@coreui/icons";
import AppHeaderDropdown from "./header/AppHeaderDropdown";
import Notification from "./header/Notification";

const AppHeader = () => {
  const headerRef = useRef();
  const dispatch = useDispatch();
  const sidebarShow = useSelector((state) => state.sidebarShow);

  return (
    <CHeader
      position="sticky"
      ref={headerRef}
      style={{
        top: 0,
        zIndex: 1030,
        padding: 0,
        margin: 0,
        width: "100%",
        backgroundColor: "#042954",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        minHeight: "64px",
      }}
    >
      <CContainer
        fluid
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          width: "100%",
        }}
      >
        {/* LEFT — hamburger */}
        <CHeaderToggler
          onClick={() => dispatch({ type: "set", sidebarShow: !sidebarShow })}
          style={{
            color: "white",
            border: "none",
            background: "transparent",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CIcon icon={cilMenu} size="lg" style={{ color: "white" }} />
        </CHeaderToggler>

        {/* RIGHT — notifications + divider + avatar dropdown */}
        <CHeaderNav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginLeft: "auto",
          }}
        >
          <span
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: "rgba(255,255,255,0.2)",
              display: "inline-block",
            }}
          />
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  );
};

export default AppHeader;
