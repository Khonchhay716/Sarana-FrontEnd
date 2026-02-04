// src/utils/auth-permission.ts

export const AuthPermission = (
  userScopes: string[], 
  allowScopes: string[]
): boolean => {
  // Guard clause: if allowScopes is null/undefined
  if (!allowScopes) return false;

  // Extract the base scope (e.g., "user" from "user:read")
  const baseScopes: string[] = allowScopes.map((scope) => scope.split(":")[0]);

  // Create "manage" permissions for those bases (e.g., "user:manage")
  // This assumes ":manage" implies full access to that resource
  const fullAccess: string[] = baseScopes.map((item) => `${item}:manage`);

  // Combine original required scopes with the full access overrides
  const allowPermissions: string[] = [...allowScopes, ...fullAccess];

  if (allowPermissions.length === 0) return false;

  // Check if the user has AT LEAST ONE of the allowed permissions
  // Note: usage of ?. handles if userScopes is explicitly undefined/null
  return allowPermissions.some((scope) => userScopes?.includes(scope));
};