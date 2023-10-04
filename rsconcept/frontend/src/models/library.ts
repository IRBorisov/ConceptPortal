// Module: Schema library models.

import { TextMatcher } from '../utils/utils'

// ========= Users ===========
export interface IUser {
  id: number | null
  username: string
  is_staff: boolean
  email: string
  first_name: string
  last_name: string
}
export interface ICurrentUser extends Pick<IUser, 'id' | 'username' | 'is_staff'> {
  subscriptions: number[]
}
export interface IUserLoginData extends Pick<IUser, 'username'> {
  password: string
}
export interface IUserSignupData extends Omit<IUser, 'is_staff' | 'id'> {
  password: string
  password2: string
}
export interface IUserUpdateData extends Omit<IUser, 'is_staff' | 'id'> { }

export interface IUserProfile extends Omit<IUser, 'is_staff'> { }
export interface IUserInfo extends Omit<IUserProfile, 'email'> { }
export interface IUserUpdatePassword {
  old_password: string
  new_password: string
}

// ========== LibraryItem ============
export enum LibraryItemType {
  RSFORM = 'rsform',
  OPERATIONS_SCHEMA = 'oss'
}

export interface ILibraryItem {
  id: number
  item_type: LibraryItemType
  title: string
  alias: string
  comment: string
  is_common: boolean
  is_canonical: boolean
  time_create: string
  time_update: string
  owner: number | null
}

export interface ILibraryUpdateData
  extends Omit<ILibraryItem, 'time_create' | 'time_update' | 'id' | 'owner'> {
}

// ============= API ===============
export function matchLibraryItem(query: string, target: ILibraryItem): boolean {
  const matcher = new TextMatcher(query);
  return matcher.test(target.alias) || matcher.test(target.title);
}

