/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import { useContext } from "react";
import { CNavGroup, CNavItem } from "@coreui/react";
import {
  UserOutlined,
  FileTextOutlined,
  NotificationOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { MessageCircle } from "lucide-react";
import { Landmark, BookOpenCheck } from "lucide-react";
import { AppContext } from "./Context/AppContext";

const iconStyle = { fontSize: "20px" };
const yellow = "text-[#fabf22]";

const useNav = () => {
  const { user } = useContext(AppContext);

  // ✅ Fixed: user?.role (not user?.user?.role)
  // API returns: { _id, name, email, role, ... } — no nested user object
  const role = user?.role;

  const adminNav = [
    {
      component: CNavItem,
      name: "Admin Dashboard",
      to: "/admin/dashboard",
      color: yellow,
      icon: (
        <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />
      ),
    },
    {
      component: CNavGroup,
      name: "Masters",
      to: "/",
      color: yellow,
      icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: "Services",
          to: "/admin/services",
          color: yellow,
          icon: (
            <BookOpenCheck className={`me-3 ${yellow}`} style={iconStyle} />
          ),
        },
      ],
    },
    {
      component: CNavItem,
      name: "Doctor Management",
      to: "/admin/doctor",
      color: yellow,
      icon: <UserOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: "Staff Management",
      to: "/admin/staff",
      color: yellow,
      icon: <Landmark className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: "Admissions",
      to: "/admin/admissions",
      color: yellow,
      icon: (
        <NotificationOutlined className={`me-3 ${yellow}`} style={iconStyle} />
      ),
    },
    {
      component: CNavItem,
      name: "Users",
      to: "/admin/users",
      color: yellow,
      icon: (
        <UserOutlined className={`me-3 ${yellow}`} style={iconStyle} />
      ),
    },
  ];

  /* ================= DOCTOR NAV ================= */
  const doctorNav = [
    {
      component: CNavItem,
      name: "Admissions",
      to: "/admin/admissions",
      color: yellow,
      icon: (
        <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />
      ),
    },
  ];

  /* ================= STAFF NAV ================= */
  const staffNav = [
    {
      component: CNavItem,
      name: "Admissions",
      to: "/admin/admissions",
      color: yellow,
      icon: (
        <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />
      ),
    },
  ];

  /* ================= ROLE SWITCH ================= */
  // ✅ Fixed: return [] instead of null so AppSidebarNav never gets null items
  if (!role) return [];
  if (role === "Admin") return adminNav;
  if (role === "Doctor") return doctorNav;
  if (role === "Staff") return staffNav;

  return [];
};

export default useNav;
