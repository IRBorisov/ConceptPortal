import { z } from 'zod';

import { limits, patterns } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

/** Represents user profile for viewing and editing. */
export type IUserProfile = z.infer<typeof schemaUserProfile>;

/** Represents user reference information. */
export type IUserInfo = z.infer<typeof schemaUserInfo>;

/** Represents signup data, used to create users. */
export type IUserSignupDTO = z.infer<typeof schemaUserSignup>;

/** Represents user data, intended to update user profile in persistent storage. */
export type IUpdateProfileDTO = z.infer<typeof schemaUpdateProfile>;

// ========= SCHEMAS ========
export const schemaUser = z.strictObject({
  id: z.number(),
  username: z.string().nonempty(errorMsg.requiredField),
  is_staff: z.boolean(),
  email: z.email(errorMsg.emailField),
  first_name: z.string(),
  last_name: z.string()
});

export const schemaUserProfile = schemaUser.omit({ is_staff: true });

export const schemaUserInfo = schemaUser.omit({ username: true, email: true, is_staff: true });

const schemaUserInput = z.strictObject({
  username: z
    .string()
    .nonempty(errorMsg.requiredField)
    .regex(RegExp(patterns.login), errorMsg.loginFormat)
    .max(limits.len_alias, errorMsg.aliasLength),
  email: z.email(errorMsg.emailField).max(limits.len_email, errorMsg.emailLength),
  first_name: z.string().max(limits.len_alias, errorMsg.aliasLength),
  last_name: z.string().max(limits.len_alias, errorMsg.aliasLength)
});

export const schemaUserSignup = schemaUserInput
  .extend({
    password: z.string().max(limits.len_alias, errorMsg.aliasLength).nonempty(errorMsg.requiredField),
    password2: z.string().max(limits.len_alias, errorMsg.aliasLength).nonempty(errorMsg.requiredField)
  })
  .refine(schema => schema.password === schema.password2, { path: ['password2'], message: errorMsg.passwordsMismatch });

export const schemaUpdateProfile = schemaUserInput.omit({
  username: true
});
