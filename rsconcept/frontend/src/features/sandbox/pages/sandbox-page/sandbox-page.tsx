'use client';

import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { z } from 'zod';

import { RSModelTabID } from '@/app/navigation/navigation-context';
import { ConstituentaTooltip } from '@/features/rsform/components/constituenta-tooltip';

import { useResetModification } from '@/hooks/use-reset-modification';

import { SandboxState } from '../../context/bundle-state';
import { SandboxModelState } from '../../context/sandbox-model-state';
import { SandboxSchemaState } from '../../context/sandbox-schema-state';
import { SandboxTabs } from '../sandbox-editor/sandbox-tabs';

const paramsModel = z.strictObject({
  tab: z.preprocess(v => (v ? Number(v) : undefined), z.enum(RSModelTabID).default(RSModelTabID.CARD)),
  activeID: z.coerce
    .number()
    .nullish()
    .transform(v => v ?? undefined)
});

export function SandboxPage() {
  useResetModification();

  const location = useLocation();

  const urlData = useMemo(function parseSandboxURL() {
    const params = new URLSearchParams(location.search);
    return paramsModel.parse({
      tab: params.get('tab'),
      activeID: params.get('active')
    });
  }, [location.search]);

  return (
    <SandboxState>
      <ConstituentaTooltip />
      <div className='relative min-h-full'>
        <SandboxModelState>
          <SandboxSchemaState>
            <SandboxTabs activeID={urlData.activeID} activeTab={urlData.tab} />
          </SandboxSchemaState>
        </SandboxModelState>
      </div>
    </SandboxState >
  );
}
