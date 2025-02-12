import { z } from 'zod';

import { errorMsg } from '@/utils/labels';

/**
 * Represents CurrentUser information.
 */
export interface ICurrentUser {
  id: number | null;
  username: string;
  is_staff: boolean;
  editor: number[];
}

/**
 * Represents login data, used to authenticate users.
 */
export const schemaUserLogin = z.object({
  username: z.string().nonempty(errorMsg.requiredField),
  password: z.string().nonempty(errorMsg.requiredField)
});

/**
 * Represents login data, used to authenticate users.
 */
export type IUserLoginDTO = z.infer<typeof schemaUserLogin>;

/**
 * Represents data needed to update password for current user.
 */
export const schemaChangePassword = z
  .object({
    old_password: z.string().nonempty(errorMsg.requiredField),
    new_password: z.string().nonempty(errorMsg.requiredField),
    new_password2: z.string().nonempty(errorMsg.requiredField)
  })
  .refine(schema => schema.new_password === schema.new_password2, {
    path: ['new_password2'],
    message: errorMsg.passwordsMismatch
  })
  .refine(schema => schema.old_password !== schema.new_password, {
    path: ['new_password'],
    message: errorMsg.passwordsSame
  });

/**
 * Represents data needed to update password for current user.
 */
export type IChangePasswordDTO = z.infer<typeof schemaChangePassword>;

/**
 * Represents password reset request data.
 */
export interface IRequestPasswordDTO {
  email: string;
}

/**
 * Represents password reset data.
 */
export interface IResetPasswordDTO {
  password: string;
  token: string;
}

/**
 * Represents password token data.
 */
export interface IPasswordTokenDTO {
  token: string;
}
