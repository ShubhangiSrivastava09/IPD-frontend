import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { CBadge, CNavLink, CSidebarNav } from "@coreui/react";
import { ChevronDown, ChevronRight } from "lucide-react";

const NAV_COLOR = "#fabf22";
const ACTIVE_BG = "rgba(250, 191, 34, 0.15)";

export const AppSidebarNav = ({ items }) => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (index) => {
    setOpenGroups((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const navLink = (name, icon, badge, indent = false) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
      }}
    >
      {icon ? (
        <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {icon}
        </span>
      ) : indent ? (
        <span
          style={{
            display: "inline-block",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: NAV_COLOR,
            flexShrink: 0,
            marginLeft: "4px",
          }}
        />
      ) : null}
      <span style={{ color: NAV_COLOR, fontSize: "14px", fontWeight: 500 }}>
        {name}
      </span>
      {badge && (
        <CBadge color={badge.color} className="ms-auto" size="sm">
          {badge.text}
        </CBadge>
      )}
    </div>
  );

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, color, ...rest } = item;
    const Component = component;
    const isActive = location.pathname === rest.to;

    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <CNavLink
            {...(rest.to && { as: NavLink })}
            {...(rest.href && { target: "_blank", rel: "noopener noreferrer" })}
            {...rest}
            style={{
              display: "flex",
              alignItems: "center",
              padding: indent ? "8px 16px 8px 40px" : "10px 16px",
              margin: "2px 8px",
              borderRadius: "8px",
              backgroundColor: isActive ? ACTIVE_BG : "transparent",
              cursor: "pointer",
              textDecoration: "none",
              transition: "background 0.2s",
              color: NAV_COLOR,
            }}
          >
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: indent ? "8px 16px 8px 40px" : "10px 16px",
              margin: "2px 8px",
            }}
          >
            {navLink(name, icon, badge, indent)}
          </div>
        )}
      </Component>
    );
  };

  // ✅ Custom group — no CNavGroup, uses useState to expand/collapse in normal flow
  const navGroup = (item, index) => {
    const { name, icon, items: subItems } = item;
    const isOpen = !!openGroups[index];

    return (
      <div key={index}>
        {/* Group header / toggler */}
        <div
          onClick={() => toggleGroup(index)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            margin: "2px 8px",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = ACTIVE_BG)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {icon && (
              <span
                style={{
                  color: NAV_COLOR,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                {icon}
              </span>
            )}
            <span
              style={{ color: NAV_COLOR, fontSize: "14px", fontWeight: 500 }}
            >
              {name}
            </span>
          </div>
          {/* Chevron */}
          <span
            style={{ color: NAV_COLOR, display: "flex", alignItems: "center" }}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </div>

        {/* Sub-items — render in normal document flow, no absolute positioning */}
        {isOpen && (
          <div style={{ overflow: "hidden" }}>
            {subItems?.map((subItem, subIndex) =>
              subItem.items
                ? navGroup(subItem, `${index}-${subIndex}`)
                : navItem(subItem, subIndex, true),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <CSidebarNav as={SimpleBar} style={{ paddingTop: "8px" }}>
      {items &&
        items.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index),
        )}
    </CSidebarNav>
  );
};

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};
