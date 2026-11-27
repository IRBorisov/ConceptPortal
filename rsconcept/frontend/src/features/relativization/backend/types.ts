import { z } from 'zod';

import { schemaAttribution, schemaConstituentaBasics } from '@/features/rsform';

export const schemaRelativizationInput = z.strictObject({
  source_time_update: z.string(),
  target: z.number(),
  excluded: z.array(z.number()),
  locale: z.enum(['en', 'ru', 'fr']),
  context_name: z.string().trim().min(1)
});

const schemaRelativizationText = z.strictObject({
  term_raw: z.string(),
  definition_raw: z.string(),
  convention: z.string()
});
const schemaScope = z.enum(['context', 'value']);

export const schemaRelativizationDraft = z.strictObject({
  items: z.array(schemaConstituentaBasics),
  attribution: z.array(schemaAttribution),
  revision: z.string(),
  prior: z.array(
    z.strictObject({ id: z.number(), fields: schemaRelativizationText.partial(), stillCurrent: z.boolean() })
  ),
  proposals: z.array(
    z.strictObject({
      id: z.number(),
      origin: z.number().nullable(),
      role: z.enum(['preserved', 'carrier', 'axis', 'relation', 'family', 'callable', 'condition', 'accessor']),
      sourceAlias: z.string().nullable(),
      before: schemaRelativizationText,
      beforeType: z.string(),
      afterType: z.string(),
      component: z
        .strictObject({
          source: z.string(),
          path: z.array(z.number()),
          scope: schemaScope,
          term: z.string()
        })
        .nullable(),
      coordinates: z.array(z.strictObject({ path: z.array(z.number()), scope: schemaScope, label: z.string() })),
      ambiguous: z.array(z.string()),
      missing: z.array(z.enum(['term_raw', 'definition_raw', 'convention'])),
      inKernel: z.boolean(),
      changed: z.boolean(),
      formalInvalid: z.boolean()
    })
  )
});

export const schemaSkipRelativizationReview = z.strictObject({ skip_review: z.literal(true) });

export const schemaConfirmRelativizationReview = z.strictObject({
  skip_review: z.literal(false).optional(),
  revision: z.string(),
  reviewed: z.array(z.number()),
  edits: z.array(schemaRelativizationText.extend({ id: z.number(), clarified: z.boolean() }))
});

export type RelativizationParametersDTO = z.infer<typeof schemaRelativizationInput>;
export type RelativizationDraftDTO = z.infer<typeof schemaRelativizationDraft>;
