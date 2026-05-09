import { RSModelTabID, RSTabID } from './navigation-context';

/** Query params when navigating from an RSModel URL to the parent RSForm. */
export function buildModelToSchemaQuery(): { tab: number; active?: number } {
  const { tab: modelTab, active } = readBrowserTabActive();
  const mt = modelTab ?? RSModelTabID.CARD;
  return {
    tab: modelRouteTabToSchemaTab(mt),
    ...(active !== undefined ? { active } : {})
  };
}

/** Query params when navigating from an RSForm URL to an RSModel for the same schema. */
export function buildSchemaToModelQuery(): { tab: number; active?: number } {
  const { tab: schemaTab, active } = readBrowserTabActive();
  const st = schemaTab ?? RSTabID.CARD;
  return {
    tab: schemaRouteTabToModelTab(st),
    ...(active !== undefined ? { active } : {})
  };
}

/** Query params when switching between RSModels of the same schema (tab/active stay on the model URL scheme). */
export function buildSiblingModelQuery(): { tab: number; active?: number } {
  const { tab, active } = readBrowserTabActive();
  return {
    tab: tab ?? RSModelTabID.CARD,
    ...(active !== undefined ? { active } : {})
  };
}

// ========== Internal helpers ==========
function readBrowserTabActive(): { tab?: number; active?: number } {
  const url = new URL(window.location.href);
  const tabRaw = url.searchParams.get('tab');
  const activeRaw = url.searchParams.get('active');
  const tab = tabRaw !== null && tabRaw !== '' ? Number(tabRaw) : undefined;
  const active = activeRaw !== null && activeRaw !== '' ? Number(activeRaw) : undefined;
  return {
    tab: tab !== undefined && !Number.isNaN(tab) ? tab : undefined,
    active: active !== undefined && !Number.isNaN(active) ? active : undefined
  };
}

function modelRouteTabToSchemaTab(modelTab: number): number {
  if (modelTab === RSModelTabID.VALUE_EDIT || modelTab === RSModelTabID.EVALUATOR) {
    return RSTabID.CST_EDIT;
  }
  if (
    modelTab === RSModelTabID.CARD ||
    modelTab === RSModelTabID.CST_LIST ||
    modelTab === RSModelTabID.CST_EDIT ||
    modelTab === RSModelTabID.GRAPH
  ) {
    return modelTab;
  }
  return RSTabID.CARD;
}

function schemaRouteTabToModelTab(schemaTab: number): number {
  if (
    schemaTab === RSTabID.CARD ||
    schemaTab === RSTabID.CST_LIST ||
    schemaTab === RSTabID.CST_EDIT ||
    schemaTab === RSTabID.GRAPH
  ) {
    return schemaTab;
  }
  return RSModelTabID.CARD;
}
