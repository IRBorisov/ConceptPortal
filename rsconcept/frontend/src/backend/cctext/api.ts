import { ILexemeData, IWordFormPlain } from '@/models/language';

import { axiosPost } from '../apiTransport';

/**
 * Represents API result for text output.
 */
export interface ITextResult {
  result: string;
}

export const cctextApi = {
  baseKey: 'cctext',

  inflectText: (data: IWordFormPlain) =>
    axiosPost<IWordFormPlain, ITextResult>({
      endpoint: '/api/cctext/inflect',
      request: { data: data }
    }),
  parseText: (data: { text: string }) =>
    axiosPost<{ text: string }, ITextResult>({
      endpoint: '/api/cctext/parse',
      request: { data: data }
    }),
  generateLexeme: (data: { text: string }) =>
    axiosPost<{ text: string }, ILexemeData>({
      endpoint: '/api/cctext/generate-lexeme',
      request: { data: data }
    })
};
