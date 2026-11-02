'use client';

import { useEffect, useEffectEvent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router';
import { z } from 'zod';

import { useTx } from '@/i18n';

import { urls, useConceptNavigation } from '@/app';
import { RSTabID } from '@/app/navigation/navigation-context';
import { tabQuerySchema } from '@/app/navigation/tab-query';

import { isAxiosError } from '@/backend/api-transport';
import { Divider } from '@/components/container';
import { TextURL } from '@/components/control';
import { type ErrorData } from '@/components/info-error';
import { useQueryStrings } from '@/hooks/use-query-strings';
import { useResetModification } from '@/hooks/use-reset-modification';
import { optionalQueryInteger } from '@/utils/query-integer';
import { rethrowIfStaleBundleError } from '@/utils/stale-bundle-error';

import { ConstituentaTooltip } from '../../components/constituenta-tooltip';

import { RSFormTabs } from './rsform-tabs';
import { SchemaEditState } from './schema-edit-state';

const paramsSchema = z.strictObject({
  id: optionalQueryInteger(),
  version: optionalQueryInteger(),
  tab: tabQuerySchema(RSTabID, RSTabID.CARD),
  activeID: optionalQueryInteger()
});

export function RSFormPage() {
  useResetModification();

  const router = useConceptNavigation();
  const params = useParams();
  const query = useQueryStrings();

  const urlData = paramsSchema.parse({
    id: params.id,
    version: query.get('v'),
    tab: query.get('tab'),
    activeID: query.get('active')
  });

  const redirectToNotFound = useEffectEvent(function redirectToNotFound() {
    router.replace({ path: urls.page404, force: true });
  });

  useEffect(
    function redirectMissingSchemaId() {
      if (!urlData.id) {
        redirectToNotFound();
      }
    },
    [urlData.id]
  );

  if (!urlData.id) {
    return null;
  }
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <ProcessError error={error as ErrorData} isArchive={!!urlData.version} itemID={urlData.id} />
      )}
    >
      <ConstituentaTooltip />
      <SchemaEditState itemID={urlData.id} activeVersion={urlData.version}>
        <RSFormTabs activeID={urlData.activeID} activeTab={urlData.tab} />
      </SchemaEditState>
    </ErrorBoundary>
  );
}

// ====== Internals =========
function ProcessError({
  error,
  isArchive,
  itemID
}: {
  error: ErrorData;
  isArchive: boolean;
  itemID?: number;
}): React.ReactElement | null {
  const tx = useTx();
  rethrowIfStaleBundleError(error);

  if (isAxiosError(error) && error.response) {
    if (error.response.status === 404) {
      return (
        <div className='flex flex-col items-center p-2 mx-auto'>
          <p>{tx('tx.schema.notFound')}</p>
          <div className='flex justify-center'>
            <TextURL text={tx('tx.lib.library')} href='/library' />
            {isArchive ? <Divider vertical margins='mx-3' /> : null}
            {isArchive ? <TextURL text={tx('tx.lib.version.latest')} href={`/rsforms/${itemID}`} /> : null}
          </div>
        </div>
      );
    } else if (error.response.status === 403) {
      return (
        <div className='flex flex-col items-center p-2 mx-auto'>
          <p>{tx('tx.lib.access.forbidden')}</p>
          <TextURL text={tx('tx.lib.library')} href='/library' />
        </div>
      );
    }
  }
  throw error as Error;
}
