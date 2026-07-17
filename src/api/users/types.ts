export const UserRole = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  CITIZEN: "CITIZEN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.MEMBER]: "Membro",
  [UserRole.CITIZEN]: "Cidadão",
}