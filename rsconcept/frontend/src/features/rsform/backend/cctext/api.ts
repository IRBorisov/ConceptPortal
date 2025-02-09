import { axiosPost } from '@/backend/apiTransport';

/**
 * Represents API result for text output.
 */
export interface ITextResult {
  result: string;
}

/**
 * Represents wordform data used for backend communication.
 */
export interface IWordFormDTO {
  text: string;
  grams: string;
}

/**
 * Represents lexeme response containing multiple {@link Wordform}s.
 */
export interface ILexemeResponse {
  items: IWordFormDTO[];
}

export const cctextApi = {
  baseKey: 'cctext',

  inflectText: (data: IWordFormDTO) =>
    axiosPost<IWordFormDTO, ITextResult>({
      endpoint: '/api/cctext/inflect',
      request: { data: data }
    }),
  parseText: (data: { text: string }) =>
    axiosPost<{ text: string }, ITextResult>({
      endpoint: '/api/cctext/parse',
      request: { data: data }
    }),
  generateLexeme: (data: { text: string }) =>
    axiosPost<{ text: string }, ILexemeResponse>({
      endpoint: '/api/cctext/generate-lexeme',
      request: { data: data }
    })
};
