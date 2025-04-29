import { axiosPost } from '@/backend/api-transport';
import { KEYS } from '@/backend/configuration';

import {
  type ILexemeResponse,
  type ITextResult,
  type IWordFormDTO,
  schemaLexemeResponse,
  schemaTextResult
} from './types';

export const cctextApi = {
  baseKey: KEYS.cctext,

  inflectText: (data: IWordFormDTO) =>
    axiosPost<IWordFormDTO, ITextResult>({
      schema: schemaTextResult,
      endpoint: '/api/cctext/inflect',
      request: { data: data }
    }),
  parseText: (data: { text: string }) =>
    axiosPost<{ text: string }, ITextResult>({
      schema: schemaTextResult,
      endpoint: '/api/cctext/parse',
      request: { data: data }
    }),
  generateLexeme: (data: { text: string }) =>
    axiosPost<{ text: string }, ILexemeResponse>({
      schema: schemaLexemeResponse,
      endpoint: '/api/cctext/generate-lexeme',
      request: { data: data }
    })
} as const;
