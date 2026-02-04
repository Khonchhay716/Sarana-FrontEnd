// src/components/AuthPermissionScope.tsx
import React, { ReactNode, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthPermission } from "./AuthPermission";

interface UserRole {
  id: number;
  name: string;
  description: string;
}

interface LocalStorageUser {
  accessToken: string;
  email: string;
  permissions: string[];
  roles: UserRole[];
  firstName?: string;
  lastName?: string;
  userId?: number;
  username?: string;
}

interface ProtextRouteProps {
  children: ReactNode;
  requiredRole?: string;
  scopes?: string[];
}

interface UnauthorizedWrapperProps {
  children: ReactNode;
}

const UnauthorizedWrapper: React.FC<UnauthorizedWrapperProps> = ({ children }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100%",
    }}
  >
    {children}
  </div>
);

const ProtextRoute: React.FC<ProtextRouteProps> = ({ 
  children, 
  requiredRole, 
  scopes = [] 
}) => {
  const location = useLocation();
  const user: LocalStorageUser | null = useMemo(() => {
    const storedString = localStorage.getItem("CurrentUserLibrary");
    if (!storedString) return null;
    try {
      return JSON.parse(storedString) as LocalStorageUser;
    } catch (error) {
      console.error("Error parsing CurrentUserLibrary:", error);
      return null;
    }
  }, []);

  if (!user || !user.accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Role check
  // Your roles are objects, so we must check if ANY role name matches the requiredRole
  if (requiredRole) {
    const hasRequiredRole = user.roles?.some((role) => role.name === requiredRole);

    if (!hasRequiredRole) {
      return (
        <UnauthorizedWrapper>
          {/* <Error404 /> */}
          <div>Error 404 - Not Found (Role mismatch)</div>
        </UnauthorizedWrapper>
      );
    }
  }

  // 3. Scope / Permission check
  // In your screenshot, the key is 'permissions', but AuthPermission expects 'scopes'
  const userScopes: string[] = user.permissions || [];
  
  const hasAllScopes = AuthPermission(userScopes, scopes);

  if (!hasAllScopes) {
    return (
      <UnauthorizedWrapper>
         <div>Error 403 - Unauthorized (Scope mismatch)</div>
      </UnauthorizedWrapper>
    );
  }

  return <>{children}</>;
};

export default ProtextRoute;