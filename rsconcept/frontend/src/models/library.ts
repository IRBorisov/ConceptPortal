/**
 * Module: Models for Library entities and Users.
 */

/**
 * Represents user detailed information.
 * Some information should only be accessible to authorized users
 */
export interface IUser {
  id: number | null;
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
  subscriptions: number[];
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
 * Represents type of library items.
 */
export enum LibraryItemType {
  RSFORM = 'rsform',
  OPERATIONS_SCHEMA = 'oss'
}

/**
 * Represents library item common data typical for all item types.
 */
export interface ILibraryItem {
  id: number;
  item_type: LibraryItemType;
  title: string;
  alias: string;
  comment: string;
  is_common: boolean;
  is_canonical: boolean;
  time_create: string;
  time_update: string;
  owner: number | null;
}

/**
 * Represents library item extended data.
 */
export interface ILibraryItemEx extends ILibraryItem {
  subscribers: number[];
}

/**
 * Represents update data for editing {@link ILibraryItem}.
 */
export interface ILibraryUpdateData extends Omit<ILibraryItem, 'time_create' | 'time_update' | 'id' | 'owner'> {}
