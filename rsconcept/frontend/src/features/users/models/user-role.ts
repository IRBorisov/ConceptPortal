/** Represents user access mode. */
export const UserRole = {
  READER: 0,
  EDITOR: 1,
  OWNER: 2,
  ADMIN: 3
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Represents user access mode flags. */
export interface RoleFlags {
  isOwner: boolean;
  isEditor: boolean;
  isStaff: boolean;
  adminMode: boolean;
}
