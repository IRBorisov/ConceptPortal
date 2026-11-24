import { z } from 'zod';

import { axiosPost } from '@/backend/api-transport';
import { KEYS } from '@/backend/configuration';

import { type LexemeResponse, schemaLexemeResponse } from './types';

export const cctextApi = {
  baseKey: KEYS.cctext,

  inflect: (data: { text: string; grams: string }, signal?: AbortSignal) =>
    axiosPost<typeof data, { result: string }>({
      schema: z.strictObject({ result: z.string() }),
      endpoint: '/api/cctext/inflect',
      request: { data },
      options: { signal }
    }),

  generateLexeme: (data: { text: string }) =>
    axiosPost<{ text: string }, LexemeResponse>({
      schema: schemaLexemeResponse,
      endpoint: '/api/cctext/generate-lexeme',
      request: { data: data }
    })
} as const;
