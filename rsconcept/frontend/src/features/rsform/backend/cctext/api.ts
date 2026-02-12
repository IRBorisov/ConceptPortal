import { axiosPost } from '@/backend/api-transport';
import { KEYS } from '@/backend/configuration';

import {
  type LexemeResponse,
  schemaLexemeResponse,
  schemaTextResult,
  type TextResult,
  type WordFormDTO
} from './types';

export const cctextApi = {
  baseKey: KEYS.cctext,

  inflectText: (data: WordFormDTO) =>
    axiosPost<WordFormDTO, TextResult>({
      schema: schemaTextResult,
      endpoint: '/api/cctext/inflect',
      request: { data: data }
    }),
  parseText: (data: { text: string; }) =>
    axiosPost<{ text: string; }, TextResult>({
      schema: schemaTextResult,
      endpoint: '/api/cctext/parse',
      request: { data: data }
    }),
  generateLexeme: (data: { text: string; }) =>
    axiosPost<{ text: string; }, LexemeResponse>({
      schema: schemaLexemeResponse,
      endpoint: '/api/cctext/generate-lexeme',
      request: { data: data }
    })
} as const;
