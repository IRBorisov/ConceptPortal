import { z } from 'zod';

/** Represents lexeme response containing multiple {@link Wordform}s. */
export type LexemeResponse = z.infer<typeof schemaLexemeResponse>;

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
