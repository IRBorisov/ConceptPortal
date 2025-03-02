import { z } from 'zod';

/** Represents API result for text output. */
export type ITextResult = z.infer<typeof schemaTextResult>;

/** Represents wordform data used for backend communication. */
export type IWordFormDTO = z.infer<typeof schemaWordForm>;

/** Represents lexeme response containing multiple {@link Wordform}s. */
export type ILexemeResponse = z.infer<typeof schemaLexemeResponse>;

// ====== Schemas =========

export const schemaTextResult = z.strictObject({
  result: z.string()
});

export const schemaWordForm = z.strictObject({
  text: z.string(),
  grams: z.string()
});

export const schemaLexemeResponse = z.strictObject({
  items: z.array(schemaWordForm)
});
