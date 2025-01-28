/**
 * Module: Models for Users.
 */

import { LibraryItemID } from './library';

/**
 * Represents {@link User} identifier type.
 */
export type UserID = number;

/**
 * Represents user detailed information.
 * Some information should only be accessible to authorized users
 */
export interface IUser {
  id: UserID;
  username: string;
  is_staff: boolean;
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Represents CurrentUser information.
 */
export interface ICurrentUser {
  id: UserID | null;
  username: string;
  is_staff: boolean;
  editor: LibraryItemID[];
}

/**
 * Represents signup data, used to create new users.
 */
export interface IUserSignupData extends Omit<IUser, 'is_staff' | 'id'> {
  password: string;
  password2: string;
}

/**
 * Represents user profile for viewing and editing {@link IUser}.
 */
export interface IUserProfile extends Omit<IUser, 'is_staff'> {}

/**
 * Represents user reference information.
 */
export interface IUserInfo extends Omit<IUserProfile, 'email' | 'username'> {}

/**
 * Represents user access mode.
 */
export enum UserRole {
  READER = 0,
  EDITOR,
  OWNER,
  ADMIN
}
