// src/components/ComponentPermission.tsx
import React, { ReactNode, useMemo } from "react";

// --- Types ---

interface UserRole {
  id: number;
  name: string;
  description: string;
}

interface LocalStorageUser {
  accessToken: string;
  permissions: string[]; // This maps to your "scopes"
  roles: UserRole[];
}

interface ComponentPermissionProps {
  scopes?: string[];
  requireAll?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}
const getLocalUser = (): LocalStorageUser | null => {
  const stored = localStorage.getItem("CurrentUserLibrary");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as LocalStorageUser;
  } catch {
    return null;
  }
};

// --- Component Implementation ---

const ComponentPermission: React.FC<ComponentPermissionProps> = ({
  scopes = [],
  requireAll = [],
  children,
  fallback = null,
}) => {
  const user = useMemo(() => getLocalUser(), []);
  const userPermissions = user?.permissions || [];

  const hasScope = (scope: string) => userPermissions.includes(scope);

  let hasPermission = false;

  if (requireAll.length > 0) {
    // Must have EVERY permission in the requireAll list
    hasPermission = requireAll.every((scope) => hasScope(scope));
  } else if (scopes.length > 0) {
    // Must have AT LEAST ONE permission in the scopes list
    hasPermission = scopes.some((scope) => hasScope(scope));
  } else {
    // If no scopes are defined, default to true or adjust based on your logic
    hasPermission = true;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default ComponentPermission;

// --- Hook Implementation ---

export const usePermission = () => {
  const user = getLocalUser();
  const userPermissions = user?.permissions || [];

  const hasPermission = (scope: string) => userPermissions.includes(scope);
  
  const hasAllPermissions = (scopes: string[]) => 
    scopes.every((scope) => userPermissions.includes(scope));
    
  const hasAnyPermission = (scopes: string[]) => 
    scopes.some((scope) => userPermissions.includes(scope));

  return { 
    hasPermission, 
    hasAllPermissions, 
    hasAnyPermission, 
    userScopes: userPermissions 
  };
};