import { z } from 'zod';

import { limits } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';

/** Represents AI prompt. */
export type IPromptTemplate = IPromptTemplateDTO;

export type IPromptTemplateInfo = z.infer<typeof schemaPromptTemplateInfo>;

/** Full prompt template as returned by backend. */
export type IPromptTemplateDTO = z.infer<typeof schemaPromptTemplate>;

/** List item for available prompt templates (no text field). */
export type IPromptTemplateListDTO = z.infer<typeof schemaPromptTemplateList>;

/** Data for creating a prompt template. */
export type ICreatePromptTemplateDTO = z.infer<typeof schemaCreatePromptTemplate>;

/** Data for updating a prompt template. */
export type IUpdatePromptTemplateDTO = z.infer<typeof schemaUpdatePromptTemplate>;

// ========= SCHEMAS ========

export const schemaPromptTemplate = z.strictObject({
  id: z.number(),
  owner: z.number().nullable(),
  label: z.string(),
  description: z.string(),
  text: z.string(),
  is_shared: z.boolean()
});

const schemaPromptTemplateInput = schemaPromptTemplate
  .pick({
    is_shared: true,
    owner: true
  })
  .extend({
    label: z.string().max(limits.len_alias, errorMsg.aliasLength).nonempty(errorMsg.requiredField),
    description: z.string().max(limits.len_description, errorMsg.descriptionLength),
    text: z.string().max(limits.len_text, errorMsg.textLength)
  });

export const schemaCreatePromptTemplate = schemaPromptTemplateInput.omit({
  owner: true
});

export const schemaUpdatePromptTemplate = schemaPromptTemplateInput;

export const schemaPromptTemplateInfo = schemaPromptTemplate.pick({
  id: true,
  owner: true,
  label: true,
  description: true,
  is_shared: true
});

export const schemaPromptTemplateList = schemaPromptTemplateInfo.array();
