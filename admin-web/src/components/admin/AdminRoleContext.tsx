"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StaffRole } from "@/lib/admin-api";

const AdminRoleContext = createContext<StaffRole | null>(null);

export function AdminRoleProvider({
  role,
  children,
}: {
  role: StaffRole;
  children: ReactNode;
}) {
  return (
    <AdminRoleContext.Provider value={role}>{children}</AdminRoleContext.Provider>
  );
}

export function useAdminRole(): StaffRole {
  const role = useContext(AdminRoleContext);
  if (!role) {
    throw new Error("useAdminRole must be used within AdminRoleProvider");
  }
  return role;
}

export function useAdminRoleOptional(): StaffRole | null {
  return useContext(AdminRoleContext);
}
