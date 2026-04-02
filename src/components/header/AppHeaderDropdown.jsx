import React, { useContext, useState, useRef, useEffect } from "react";
import { cilLockLocked, cilUser } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { deleteCookie } from "../../Hooks/cookie";
import { useNavigate } from "react-router-dom";
import { useRoles } from "../../Context/AuthContext";
import { AppContext } from "../../Context/AppContext";
import { ChevronDown } from "lucide-react";

const AppHeaderDropdown = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const { role } = useRoles();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logOut = (e) => {
    e.preventDefault();
    deleteCookie("IPD");
    localStorage.removeItem("IPD");
    navigate("/login");
    window.location.reload();
  };

  const handleProfileNavigate = () => {
    if (role === "Student") navigate(`/studentdetail/:studentId`);
    else if (role === "Teacher") navigate(`/TeacherDetailPage/:teacherId`);
    setOpen(false);
  };

  const showProfile = role === "Student" || role === "Teacher";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: "8px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Name + role */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: 1.3,
            }}
          >
            {user?.name || "Guest"}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "12px",
              textTransform: "capitalize",
            }}
          >
            {role || "User"}
          </div>
        </div>

        {/* Avatar */}
        <img
          src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
          alt="Profile"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "2px solid rgba(250,191,34,0.6)",
            objectFit: "cover",
          }}
        />

        {/* Chevron */}
        <ChevronDown
          size={16}
          style={{
            color: "rgba(255,255,255,0.7)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "200px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {/* User info header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: "#f8f9fa",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: "14px",
                color: "#042954",
                textTransform: "capitalize",
              }}
            >
              {user?.name || "Guest"}
            </div>
            <div
              style={{ fontSize: "12px", color: "#6c757d", marginTop: "2px" }}
            >
              {user?.email || ""}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#fabf22",
                fontWeight: 500,
                marginTop: "2px",
                textTransform: "capitalize",
              }}
            >
              {role || "User"}
            </div>
          </div>

          {/* Menu items */}
      {showProfile && (
  <button
    onClick={handleProfileNavigate}
    style={menuItemStyle}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <CIcon icon={cilUser} style={{ width: '16px', height: '16px', marginRight: '10px', color: '#042954', flexShrink: 0 }} />
    <span style={{ fontSize: '14px', color: '#042954', whiteSpace: 'nowrap' }}>Profile</span>
  </button>
)}

<button
  onClick={logOut}
  style={{ ...menuItemStyle, borderTop: '1px solid #f0f0f0' }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff5f5')}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
>
  <CIcon icon={cilLockLocked} style={{ width: '16px', height: '16px', marginRight: '10px', color: '#dc3545', flexShrink: 0 }} />
  <span style={{ fontSize: '14px', color: '#dc3545', whiteSpace: 'nowrap' }}>Log Out</span>
</button>
        </div>
      )}
    </div>
  );
};

const menuItemStyle = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: "11px 16px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  transition: "background 0.15s",
  textAlign: "left",
};

export default AppHeaderDropdown;
