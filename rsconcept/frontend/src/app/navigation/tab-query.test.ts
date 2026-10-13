import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { OssTabID, RSTabID } from './navigation-context';
import { tabQuerySchema } from './tab-query';

describe('tabQuerySchema', () => {
  const ossTab = z.object({
    tab: tabQuerySchema(OssTabID, OssTabID.GRAPH)
  });
  const schemaTab = z.object({
    tab: tabQuerySchema(RSTabID, RSTabID.CARD)
  });

  it('keeps a known tab', () => {
    expect(ossTab.parse({ tab: '0' })).toEqual({ tab: OssTabID.CARD });
    expect(ossTab.parse({ tab: '1' })).toEqual({ tab: OssTabID.GRAPH });
    expect(schemaTab.parse({ tab: '3' })).toEqual({ tab: RSTabID.GRAPH });
  });

  it('uses the fallback when tab is missing', () => {
    expect(ossTab.parse({ tab: null })).toEqual({ tab: OssTabID.GRAPH });
    expect(ossTab.parse({ tab: '' })).toEqual({ tab: OssTabID.GRAPH });
    expect(schemaTab.parse({ tab: null })).toEqual({ tab: RSTabID.CARD });
  });

  it('uses the fallback for a tab id from another page', () => {
    expect(ossTab.parse({ tab: '3' })).toEqual({ tab: OssTabID.GRAPH });
    expect(ossTab.parse({ tab: 'foo' })).toEqual({ tab: OssTabID.GRAPH });
    expect(schemaTab.parse({ tab: '9' })).toEqual({ tab: RSTabID.CARD });
  });
});
