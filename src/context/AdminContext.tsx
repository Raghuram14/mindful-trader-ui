/**
 * Admin Context
 *
 * Manages admin state including user impersonation for debugging.
 * When impersonating, all API calls include the X-Impersonate-User header.
 *
 * REMOVAL: Delete this file and remove AdminProvider from App.tsx
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { adminApi, AdminUserListItem } from "@/api/admin";

interface AdminContextType {
  // Admin status
  isAdmin: boolean;
  isCheckingAdmin: boolean;

  // Impersonation
  impersonatedUser: AdminUserListItem | null;
  isImpersonating: boolean;
  startImpersonation: (user: AdminUserListItem) => void;
  stopImpersonation: () => void;

  // Refresh admin check
  checkAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Key for storing impersonation in session storage
const IMPERSONATE_STORAGE_KEY = "mindful_admin_impersonate";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [impersonatedUser, setImpersonatedUser] =
    useState<AdminUserListItem | null>(null);

  const checkAdminStatus = useCallback(async () => {
    setIsCheckingAdmin(true);
    try {
      const result = await adminApi.checkAdminStatus();
      setIsAdmin(result.isAdmin);

      // Clear impersonation if not admin
      if (!result.isAdmin) {
        setImpersonatedUser(null);
        sessionStorage.removeItem(IMPERSONATE_STORAGE_KEY);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setIsCheckingAdmin(false);
    }
  }, []);

  // Check admin status on mount
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // Restore impersonation from session storage
  useEffect(() => {
    if (isAdmin) {
      const stored = sessionStorage.getItem(IMPERSONATE_STORAGE_KEY);
      if (stored) {
        try {
          const user = JSON.parse(stored) as AdminUserListItem;
          setImpersonatedUser(user);
        } catch {
          sessionStorage.removeItem(IMPERSONATE_STORAGE_KEY);
        }
      }
    }
  }, [isAdmin]);

  const startImpersonation = useCallback((user: AdminUserListItem) => {
    setImpersonatedUser(user);
    sessionStorage.setItem(IMPERSONATE_STORAGE_KEY, JSON.stringify(user));
  }, []);

  const stopImpersonation = useCallback(() => {
    setImpersonatedUser(null);
    sessionStorage.removeItem(IMPERSONATE_STORAGE_KEY);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isCheckingAdmin,
        impersonatedUser,
        isImpersonating: impersonatedUser !== null,
        startImpersonation,
        stopImpersonation,
        checkAdminStatus,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

/**
 * Hook to get impersonation header for API calls
 * Returns the header object to spread into fetch options
 */
export function useImpersonationHeader(): Record<string, string> {
  const { impersonatedUser } = useAdmin();

  if (impersonatedUser) {
    return { "X-Impersonate-User": impersonatedUser._id };
  }

  return {};
}
