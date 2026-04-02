import React from "react";
import DoctorPage from "./views/pages/Admin/adminDoctorManagement/AdminDoctorManagement";
import StaffPage from "./views/pages/Admin/adminStaffManagement/AdminStaffManagement";
import ServicesPage from "./views/pages/Admin/AdminServices/AdminServices";
import AdmissionsPage from "./views/uniAdmissions/uniAdmissionsListng";
import AdmissionDetailPage from "./views/uniAdmissions/uniAdmissionsDetailsPage";
import AdminUsersPage from "./views/pages/Admin/AdminUsers/AdminUsers";
import Dashboard from "./views/dashboard/dashboard";

const routes = [
  {
    path: "/admin/doctor",
    element: DoctorPage,
    roles: ["Admin"],
  },
  {
    path: "/admin/staff",
    element: StaffPage,
    roles: ["Admin"],
  },
  {
    path: "/admin/admissions",
    element: AdmissionsPage,
    roles: ["Admin", "Doctor",  "Staff"],
  },
  {
    path: "/admin/admissions/:id",
    element: AdmissionDetailPage,
    roles: ["Admin", "Doctor",  "Staff"],
  },
  {
    path: "/admin/services",
    element: ServicesPage,
    roles: ["Admin"],
  },
  {
    path: "/admin/users",
    element: AdminUsersPage,
    roles: ["Admin"],
  },
  {
    path: "/admin/dashboard",
    element: Dashboard,
    roles: ["Admin"],
  },
];

export default routes;
