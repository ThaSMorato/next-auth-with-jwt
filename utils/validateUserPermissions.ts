type User = {
  permissions: string[];
  roles: string[];
};

type ValidateUserPermissionsParams = {
  user: User;
  permissions?: string[];
  roles?: string[];
};

export const validateUserPermissions = ({
  user,
  permissions,
  roles,
}: ValidateUserPermissionsParams) => {
  if (permissions?.length > 0) {
    const hasAllPermissions = permissions.every((permissions) =>
      user.permissions.includes(permissions)
    );

    if (!hasAllPermissions) {
      return false;
    }
  }

  if (roles?.length > 0) {
    const hasAllRoles = roles.some((roles) => user.roles.includes(roles));

    if (!hasAllRoles) {
      return false;
    }
  }

  return true;
};
