"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { hashPasscode, ADMIN_PASSCODE_HASH } from "@/lib/security";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editModalConfig, setEditModalConfig] = useState(null); // { type: "hero" | "about" | "project" | "member" | "stats" | "contact", data: any }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("rotaract_sltc_admin_session");
      if (stored === "true") setIsAdmin(true);
    }
  }, []);

  const loginAdmin = async (passcode) => {
    const hashed = await hashPasscode(passcode);
    if (hashed === ADMIN_PASSCODE_HASH) {
      setIsAdmin(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("rotaract_sltc_admin_session", "true");
      }
      return { success: true };
    }
    return { success: false, error: "Incorrect Passcode!" };
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("rotaract_sltc_admin_session");
    }
  };

  const openEditModal = (type, data = null) => {
    setEditModalConfig({ type, data });
  };

  const closeEditModal = () => {
    setEditModalConfig(null);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
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
