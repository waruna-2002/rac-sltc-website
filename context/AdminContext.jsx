"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authenticatePasscode } from "@/lib/security";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [adminRole, setAdminRole] = useState(null); // null | "super_admin" | "project_editor"
  const [editModalConfig, setEditModalConfig] = useState(null); // { type: "hero" | "about" | "project" | "member" | "stats" | "contact", data: any }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("rotaract_sltc_admin_role");
      if (storedRole === "super_admin" || storedRole === "project_editor") {
        setAdminRole(storedRole);
      } else {
        const legacySession = localStorage.getItem("rotaract_sltc_admin_session");
        if (legacySession === "true") {
          setAdminRole("super_admin");
          localStorage.setItem("rotaract_sltc_admin_role", "super_admin");
        }
      }
    }
  }, []);

  const loginAdmin = async (passcode) => {
    const authResult = await authenticatePasscode(passcode);
    if (authResult.success) {
      setAdminRole(authResult.role);
      if (typeof window !== "undefined") {
        localStorage.setItem("rotaract_sltc_admin_role", authResult.role);
        localStorage.setItem("rotaract_sltc_admin_session", "true");
      }
      return { success: true, role: authResult.role };
    }
    return { success: false, error: "Incorrect Passcode!" };
  };

  const logoutAdmin = () => {
    setAdminRole(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("rotaract_sltc_admin_role");
      localStorage.removeItem("rotaract_sltc_admin_session");
    }
  };

  const openEditModal = (type, data = null) => {
    setEditModalConfig({ type, data });
  };

  const closeEditModal = () => {
    setEditModalConfig(null);
  };

  const isAdmin = Boolean(adminRole);
  const isSuperAdmin = adminRole === "super_admin";
  const isProjectEditor = adminRole === "project_editor";

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isSuperAdmin,
        isProjectEditor,
        adminRole,
        loginAdmin,
        logoutAdmin,
        editModalConfig,
        openEditModal,
        closeEditModal,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
