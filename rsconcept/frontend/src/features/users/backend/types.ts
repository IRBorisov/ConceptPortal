import { z } from 'zod';

import { globalTx } from '@/i18n';

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
  username: z.string().nonempty(globalTx('tx.general.field.required')),
  is_staff: z.boolean(),
  email: z.email(globalTx('tx.general.email.validate')),
  first_name: z.string(),
  last_name: z.string()
});

export const schemaUserProfile = schemaUser.omit({ is_staff: true });

export const schemaUserInfo = schemaUser.omit({ username: true, email: true, is_staff: true });

const schemaUserInput = z.strictObject({
  username: z
    .string()
    .nonempty(globalTx('tx.general.field.required'))
    .regex(RegExp(patterns.login), globalTx('tx.general.username.validate'))
    .max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`),
  email: z
    .email(globalTx('tx.general.email.validate'))
    .max(limits.len_email, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_email})`),
  first_name: z.string().max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`),
  last_name: z.string().max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`)
});

export const schemaUserSignup = schemaUserInput
  .extend({
    password: z
      .string()
      .max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`)
      .nonempty(globalTx('tx.general.field.required')),
    password2: z
      .string()
      .max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`)
      .nonempty(globalTx('tx.general.field.required'))
  })
  .refine(schema => schema.password === schema.password2, {
    path: ['password2'],
    message: globalTx('tx.general.password.repeat.validate')
  });

export const schemaUpdateProfile = schemaUserInput.omit({
  username: true
});
