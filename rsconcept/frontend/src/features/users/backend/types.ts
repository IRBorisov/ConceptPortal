import { z } from 'zod';

import {} from '@/i18n';

import { limits, patterns } from '@/utils/constants';

/** Represents user profile for viewing and editing. */
export type UserProfile = z.infer<typeof schemaUserProfile>;

/** Represents user reference information. */
export type UserInfo = z.infer<typeof schemaUserInfo>;

/** Represents signup data, used to create users. */
export type UserSignupDTO = z.infer<typeof schemaUserSignup>;

/** Represents user data, intended to update user profile in persistent storage. */
export type UpdateProfileDTO = z.infer<typeof schemaUpdateProfile>;

// ========= SCHEMAS ========
export const schemaUser = z.strictObject({
  id: z.number(),
  username: z.string().nonempty('labels.error.requiredField'),
  is_staff: z.boolean(),
  email: z.email('labels.error.emailField'),
  first_name: z.string(),
  last_name: z.string()
});

export const schemaUserProfile = schemaUser.omit({ is_staff: true });

export const schemaUserInfo = schemaUser.omit({ username: true, email: true, is_staff: true });

const schemaUserInput = z.strictObject({
  username: z
    .string()
    .nonempty('labels.error.requiredField')
    .regex(RegExp(patterns.login), 'labels.error.loginFormat')
    .max(limits.len_alias, 'labels.error.aliasLength'),
  email: z.email('labels.error.emailField').max(limits.len_email, 'labels.error.emailLength'),
  first_name: z.string().max(limits.len_alias, 'labels.error.aliasLength'),
  last_name: z.string().max(limits.len_alias, 'labels.error.aliasLength')
});

export const schemaUserSignup = schemaUserInput
  .extend({
    password: z.string().max(limits.len_alias, 'labels.error.aliasLength').nonempty('labels.error.requiredField'),
    password2: z.string().max(limits.len_alias, 'labels.error.aliasLength').nonempty('labels.error.requiredField')
  })
  .refine(schema => schema.password === schema.password2, { path: ['password2'], message: 'labels.error.passwordsMismatch' });

export const schemaUpdateProfile = schemaUserInput.omit({
  username: true
});
