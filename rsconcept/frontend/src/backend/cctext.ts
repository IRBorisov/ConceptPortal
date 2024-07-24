/**
 * Endpoints: cctext.
 */

import { ILexemeData, ITextRequest, ITextResult, IWordFormPlain } from '@/models/language';

import { AxiosPost, FrontExchange } from './apiTransport';

export function postInflectText(request: FrontExchange<IWordFormPlain, ITextResult>) {
  AxiosPost({
    endpoint: `/api/cctext/inflect`,
    request: request
  });
}

export function postParseText(request: FrontExchange<ITextRequest, ITextResult>) {
  AxiosPost({
    endpoint: `/api/cctext/parse`,
    request: request
  });
}

export function postGenerateLexeme(request: FrontExchange<ITextRequest, ILexemeData>) {
  AxiosPost({
    endpoint: `/api/cctext/generate-lexeme`,
    request: request
  });
}
