import { z } from 'zod';

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

export const schemaCreatePromptTemplate = schemaPromptTemplate.pick({
  label: true,
  description: true,
  text: true,
  is_shared: true
});

export const schemaUpdatePromptTemplate = schemaPromptTemplate.pick({
  owner: true,
  label: true,
  description: true,
  text: true,
  is_shared: true
});

export const schemaPromptTemplateInfo = schemaPromptTemplate.pick({
  id: true,
  owner: true,
  label: true,
  description: true,
  is_shared: true
});

export const schemaPromptTemplateList = schemaPromptTemplateInfo.array();
