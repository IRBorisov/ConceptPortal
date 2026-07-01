import { type ConstituentaDraft } from '../models/constituenta';
import { type PortalRsformDetails, type PortalSchemaImportData, portalItemToDraft } from '../models/portal-json';
import { type SessionState } from '../models/session';

export function portalSchemaToSessionSeed(data: PortalSchemaImportData): Partial<SessionState> {
  return {
    alias: data.alias ?? '',
    title: data.title ?? '',
    comment: data.description ?? '',
    items: []
  };
}

export function portalDetailsToSessionSeed(data: PortalRsformDetails): Partial<SessionState> {
  return {
    alias: data.alias ?? '',
    title: data.title ?? '',
    comment: data.description ?? '',
    items: []
  };
}

export function portalItemsToDrafts(
  items: Array<{
    id: number;
    alias: string;
    cst_type: string;
    definition_formal?: string;
    term_raw?: string;
    definition_raw?: string;
    convention?: string;
  }>
): ConstituentaDraft[] {
  return items.map(item => portalItemToDraft(item));
}

export function portalSchemaToDrafts(data: PortalSchemaImportData): ConstituentaDraft[] {
  return portalItemsToDrafts(data.items);
}

export function portalDetailsToDrafts(data: PortalRsformDetails): ConstituentaDraft[] {
  return portalItemsToDrafts(data.items);
}
