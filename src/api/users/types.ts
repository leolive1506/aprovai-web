export const UserRole = {
  ADMIN: "ADMIN",
  COMPANY: "COMPANY",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.COMPANY]: "Empresa",
}