import { create } from 'zustand';

import { UserRole } from '@/features/users/models/user';

export interface RoleFlags {
  isOwner: boolean;
  isEditor: boolean;
  isStaff: boolean;
  adminMode: boolean;
}

interface RoleStore {
  role: UserRole;
  setRole: (value: UserRole) => void;
  adjustRole: (flags: RoleFlags) => void;
}

export const useRoleStore = create<RoleStore>()(set => ({
  role: UserRole.READER,
  setRole: value => set({ role: value }),
  adjustRole: ({ isOwner, isEditor, isStaff, adminMode }: RoleFlags) =>
    set(state => {
      if (state.role === UserRole.EDITOR && (isOwner || isStaff || isEditor)) {
        return { role: UserRole.EDITOR };
      }
      if (isStaff && (state.role === UserRole.ADMIN || adminMode)) {
        return { role: UserRole.ADMIN };
      }
      if (isOwner) {
        return { role: UserRole.OWNER };
      }
      if (isEditor) {
        return { role: UserRole.EDITOR };
      }
      return { role: UserRole.READER };
    })
}));
