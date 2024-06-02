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
export interface ICurrentUser extends Pick<IUser, 'id' | 'username' | 'is_staff'> {
  subscriptions: LibraryItemID[];
  editor: LibraryItemID[];
}

/**
 * Represents login data, used to authenticate users.
 */
export interface IUserLoginData extends Pick<IUser, 'username'> {
  password: string;
}

/**
 * Represents password reset data.
 */
export interface IResetPasswordData {
  password: string;
  token: string;
}

/**
 * Represents password token data.
 */
export interface IPasswordTokenData extends Pick<IResetPasswordData, 'token'> {}

/**
 * Represents password reset request data.
 */
export interface IRequestPasswordData extends Pick<IUser, 'email'> {}

/**
 * Represents signup data, used to create new users.
 */
export interface IUserSignupData extends Omit<IUser, 'is_staff' | 'id'> {
  password: string;
  password2: string;
}

/**
 * Represents user data, intended to update user profile in persistent storage.
 */
export interface IUserUpdateData extends Omit<IUser, 'is_staff' | 'id'> {}

/**
 * Represents user profile for viewing and editing {@link IUser}.
 */
export interface IUserProfile extends Omit<IUser, 'is_staff'> {}

/**
 * Represents user reference information.
 */
export interface IUserInfo extends Omit<IUserProfile, 'email' | 'username'> {}

/**
 * Represents data needed to update password for current user.
 */
export interface IUserUpdatePassword {
  old_password: string;
  new_password: string;
}

/**
 * Represents target {@link User}.
 */
export interface ITargetUser {
  user: UserID;
}

/**
 * Represents target multiple {@link User}.
 */
export interface ITargetUsers {
  users: UserID[];
}

/**
 * Represents user access mode.
 */
export enum UserLevel {
  READER = 0,
  EDITOR,
  OWNER,
  ADMIN
}
