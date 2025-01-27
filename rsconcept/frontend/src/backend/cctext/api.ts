import { axiosInstance } from '@/backend/axiosInstance';
import { ILexemeData, IWordFormPlain } from '@/models/language';

/**
 * Represents API result for text output.
 */
export interface ITextResult {
  result: string;
}

export const cctextApi = {
  baseKey: 'cctext',

  inflectText: (data: IWordFormPlain) =>
    axiosInstance //
      .post<ITextResult>('/api/cctext/inflect', data)
      .then(response => response.data),
  parseText: (data: { text: string }) =>
    axiosInstance //
      .post<ITextResult>('/api/cctext/parse', data)
      .then(response => response.data),
  generateLexeme: (data: { text: string }) =>
    axiosInstance //
      .post<ILexemeData>('/api/cctext/generate-lexeme', data)
      .then(response => response.data)
};
