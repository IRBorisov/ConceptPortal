'use client';

import { useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation } from 'react-router';
import { z } from 'zod';

import { RSModelTabID } from '@/app/navigation/navigation-context';
import { loadRSForm } from '@/features/rsform/backend/rsform-loader';
import { ConstituentaTooltip } from '@/features/rsform/components/constituenta-tooltip';

import { type ErrorData } from '@/components/info-error';
import { Loader } from '@/components/loader';
import { useResetModification } from '@/hooks/use-reset-modification';

import { useSandboxBundle } from '../../backend/use-sandbox-bundle';
import { SandboxRSEditState } from '../sandbox-editor/sandbox-rsedit-state';
import { SandboxRSModelState } from '../sandbox-editor/sandbox-rsmodel-state';
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
  const { bundle, setBundle, isLoading, error } = useSandboxBundle();

  const urlData = useMemo(function parseSandboxURL() {
    const params = new URLSearchParams(location.search);
    return paramsModel.parse({
      tab: params.get('tab'),
      activeID: params.get('active')
    });
  }, [location.search]);

  if (isLoading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <Loader scale={4} />
      </div>
    );
  }

  if (error && !bundle) {
    return <ProcessError error={error} />;
  }

  const activeBundle = bundle;
  if (!activeBundle) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <Loader scale={4} />
      </div>
    );
  }

  const schema = loadRSForm(activeBundle.rsform);

  return (
    <ErrorBoundary FallbackComponent={({ error: boundaryError }) => (
      <ProcessError error={boundaryError as ErrorData} />
    )}>
      <ConstituentaTooltip />
      <div className='relative min-h-full'>
        {error ? (
          <div className='mx-auto max-w-3xl px-4 pt-4 text-sm text-destructive'>
            {error.message}
          </div>
        ) : null}

        <SandboxRSModelState schema={schema} bundle={activeBundle} setBundle={setBundle}>
          <SandboxRSEditState schema={schema} setBundle={setBundle}>
            <SandboxTabs activeID={urlData.activeID} activeTab={urlData.tab} bundle={activeBundle} setBundle={setBundle} />
          </SandboxRSEditState>
        </SandboxRSModelState>
      </div>
    </ErrorBoundary>
  );
}

// ====== Internals =========
function ProcessError({ error }: { error: ErrorData; }): React.ReactElement | null {
  const message = typeof error === 'string'
    ? error
    : error.message;

  return (
    <div className='flex flex-col items-center p-4 mx-auto max-w-3xl text-center'>
      <p className='font-medium'>Ошибка загрузки песочницы</p>
      <pre className='mt-3 whitespace-pre-wrap text-sm text-destructive'>{message}</pre>
    </div>
  );
}
