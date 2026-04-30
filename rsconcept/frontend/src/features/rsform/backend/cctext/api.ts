import { axiosPost } from '@/backend/api-transport';
import { KEYS } from '@/backend/configuration';

import { type LexemeResponse, schemaLexemeResponse } from './types';

export const cctextApi = {
  baseKey: KEYS.cctext,

  generateLexeme: (data: { text: string }) =>
    axiosPost<{ text: string }, LexemeResponse>({
      schema: schemaLexemeResponse,
      endpoint: '/api/cctext/generate-lexeme',
      request: { data: data }
    })
} as const;
