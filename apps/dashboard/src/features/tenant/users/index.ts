export { UsersPage } from "./users-page";

export { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useAssignRole } from "./lib/users.hooks";
export { usersApi } from "./lib/users.api";
export type { UserRow, UserListParams, CreateUserInput, UpdateUserInput } from "./lib/users.types";

export {
  useRoles,
  usePermissionCatalog,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "./lib/roles.hooks";
export { rolesApi } from "./lib/roles.api";
export type {
  RoleRow,
  RoleListParams,
  RoleInput,
  PermissionEntry,
  PermissionCatalog,
} from "./lib/roles.types";
