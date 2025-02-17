/**
 * Module: Models for Users.
 */

/**
 * Represents user detailed information.
 * Some information should only be accessible to authorized users
 */
export interface IUser {
  id: number;
  username: string;
  is_staff: boolean;
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Represents user profile for viewing and editing {@link IUser}.
 */
export interface IUserProfile extends Omit<IUser, 'is_staff'> {}

/**
 * Represents user reference information.
 */
export interface IUserInfo extends Omit<IUserProfile, 'email' | 'username'> {}
