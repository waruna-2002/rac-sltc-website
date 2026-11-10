"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  authenticateAdmin, 
  verifyLoginOtp 
} from "@/lib/security";
import { syncSiteContentFromDatabase } from "@/lib/siteStore";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [adminRole, setAdminRole] = useState(null); // null | "super_admin" | "project_editor"
  const [isVerifying, setIsVerifying] = useState(true);
  const [editModalConfig, setEditModalConfig] = useState(null);

  // Check server-side cryptographic session on initial load
  const verifySession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.role) {
          setAdminRole(data.role);
          if (typeof window !== "undefined") {
            localStorage.setItem("rotaract_sltc_admin_role", data.role);
            localStorage.setItem("rotaract_sltc_admin_session", "true");
          }
          setIsVerifying(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Server session verification fallback:", e);
    }

    // If server reports no valid cryptographic session, invalidate any forged local storage
    setAdminRole(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("rotaract_sltc_admin_role");
      localStorage.removeItem("rotaract_sltc_admin_session");
    }
    setIsVerifying(false);
  }, []);

  useEffect(() => {
    verifySession();
    // Also trigger background sync of global website settings from MongoDB
    syncSiteContentFromDatabase();
  }, [verifySession]);

  /**
   * Log in with Email + Password (or legacy single passcode)
   */
  const loginAdmin = async (credentials) => {
    const authResult = await authenticateAdmin(credentials);

    if (authResult.success) {
      // Case 1: Untrusted device or 3-day inactivity requires OTP
      if (authResult.requireOtp) {
        return {
          success: true,
          requireOtp: true,
          email: authResult.email,
          tempToken: authResult.tempToken,
          reason: authResult.reason,
          message: authResult.message,
          devOtp: authResult.devOtp,
        };
      }

      // Case 2: Trusted device direct login
      setAdminRole(authResult.role);
      if (typeof window !== "undefined") {
        localStorage.setItem("rotaract_sltc_admin_role", authResult.role);
        localStorage.setItem("rotaract_sltc_admin_session", "true");
      }
      return { success: true, directLogin: true, role: authResult.role };
    }

    return { 
      success: false, 
      error: authResult.error || "Incorrect credentials!", 
      remainingAttempts: authResult.remainingAttempts 
    };
  };

  /**
   * Complete 2FA Login with OTP
   */
  const submitLoginOtp = async ({ email, otp, tempToken }) => {
    const result = await verifyLoginOtp({ email, otp, tempToken });
    if (result.success) {
      setAdminRole(result.role);
      if (typeof window !== "undefined") {
        localStorage.setItem("rotaract_sltc_admin_role", result.role);
        localStorage.setItem("rotaract_sltc_admin_session", "true");
      }
      return { success: true, role: result.role };
    }
    return { success: false, error: result.error, remainingAttempts: result.remainingAttempts };
  };

  const logoutAdmin = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout request failed:", e);
    }

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
        isVerifying,
        loginAdmin,
        submitLoginOtp,
        logoutAdmin,
        verifySession,
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
