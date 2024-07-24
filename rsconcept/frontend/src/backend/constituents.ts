/**
 * Endpoints: constituents.
 */

import { IConstituentaMeta, ICstUpdateData } from '@/models/rsform';

import { AxiosPatch, FrontExchange } from './apiTransport';

export function patchConstituenta(target: string, request: FrontExchange<ICstUpdateData, IConstituentaMeta>) {
  AxiosPatch({
    endpoint: `/api/constituents/${target}`,
    request: request
  });
}
