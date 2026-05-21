import { z } from 'zod';

import { globalTx } from '@/i18n';

import { limits } from '@/utils/constants';

/** Represents CurrentUser information. */
export interface ICurrentUser {
  id: number | null;
  username: string;
  is_staff: boolean;
  editor: number[];
  /** Present on `GET /users/api/auth`; used when `csrftoken` is not readable from `document.cookie`. */
  csrfToken?: string;
}

/** Logged-out user payload returned by `/users/api/auth`. */
export const anonymousCurrentUser = {
  id: null,
  username: '',
  is_staff: false,
  editor: []
} satisfies ICurrentUser;

/** Represents login data, used to authenticate users. */
export type IUserLoginDTO = z.infer<typeof schemaUserLogin>;

/** Represents data needed to update password for current user. */
export type IChangePasswordDTO = z.infer<typeof schemaChangePassword>;

/** Represents password reset request data. */
export interface IRequestPasswordDTO {
  email: string;
}

/** Represents password reset data. */
export interface IResetPasswordDTO {
  password: string;
  token: string;
}

/** Represents password token data. */
export interface IPasswordTokenDTO {
  token: string;
}

// ========= SCHEMAS ========

export const schemaUserLogin = z.strictObject({
  username: z
    .string()
    .max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`)
    .nonempty(globalTx('tx.general.field.required')),
  password: z
    .string()
    .max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`)
    .nonempty(globalTx('tx.general.field.required'))
});

export const schemaChangePassword = z
  .object({
    old_password: z
      .string()
      .max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`)
      .nonempty(globalTx('tx.general.field.required')),
    new_password: z
      .string()
      .max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`)
      .nonempty(globalTx('tx.general.field.required')),
    new_password2: z
      .string()
      .max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`)
      .nonempty(globalTx('tx.general.field.required'))
  })
  .refine(schema => schema.new_password === schema.new_password2, {
    path: ['new_password2'],
    message: globalTx('tx.general.password.repeat.validate')
  })
  .refine(schema => schema.old_password !== schema.new_password, {
    path: ['new_password'],
    message: globalTx('tx.general.password.new.validate')
  });
