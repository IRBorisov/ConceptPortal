/**
 * Endpoints: operations.
 */

import { IInlineSynthesisData, IRSFormData } from '@/models/rsform';

import { AxiosPatch, FrontExchange } from './apiTransport';

export function patchInlineSynthesis(request: FrontExchange<IInlineSynthesisData, IRSFormData>) {
  AxiosPatch({
    endpoint: `/api/operations/inline-synthesis`,
    request: request
  });
}
