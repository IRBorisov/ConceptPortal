import { z } from 'zod';

import { patterns } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

/**
 * Represents signup data, used to create new users.
 */
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

/**
 * Represents signup data, used to create new users.
 */
export type IUserSignupDTO = z.infer<typeof schemaUserSignup>;
/**
 * Represents user data, intended to update user profile in persistent storage.
 */

export const schemaUpdateProfile = z.object({
  email: z.string().email(errorMsg.emailField),
  first_name: z.string(),
  last_name: z.string()
});

/**
 * Represents user data, intended to update user profile in persistent storage.
 */
export type IUpdateProfileDTO = z.infer<typeof schemaUpdateProfile>;
