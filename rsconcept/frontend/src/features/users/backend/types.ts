import { z } from 'zod';

import { patterns } from '@/utils/constants';
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
  id: z.coerce.number(),
  username: z.string().nonempty(errorMsg.requiredField),
  is_staff: z.boolean(),
  email: z.string().email(errorMsg.emailField),
  first_name: z.string(),
  last_name: z.string()
});

export const schemaUserProfile = schemaUser.omit({ is_staff: true });

export const schemaUserInfo = schemaUser.omit({ username: true, email: true, is_staff: true });

export const schemaUserSignup = z
  .object({
    username: z.string().nonempty(errorMsg.requiredField).regex(RegExp(patterns.login), errorMsg.loginFormat),
    email: z.string().email(errorMsg.emailField),
    first_name: z.string(),
    last_name: z.string(),

    password: z.string().nonempty(errorMsg.requiredField),
    password2: z.string().nonempty(errorMsg.requiredField)
  })
  .refine(schema => schema.password === schema.password2, { path: ['password2'], message: errorMsg.passwordsMismatch });

export const schemaUpdateProfile = z.strictObject({
  email: z.string().email(errorMsg.emailField),
  first_name: z.string(),
  last_name: z.string()
});
