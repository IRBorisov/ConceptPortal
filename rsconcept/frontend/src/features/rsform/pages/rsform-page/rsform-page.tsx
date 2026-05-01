'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router';
import { z } from 'zod';

import { urls, useConceptNavigation } from '@/app';
import { useTx } from '@/app/i18n/use-tx';
import { RSTabID } from '@/app/navigation/navigation-context';

import { isAxiosError } from '@/backend/api-transport';
import { Divider } from '@/components/container';
import { TextURL } from '@/components/control';
import { type ErrorData } from '@/components/info-error';
import { useQueryStrings } from '@/hooks/use-query-strings';
import { useResetModification } from '@/hooks/use-reset-modification';
import { rethrowIfStaleBundleError } from '@/utils/stale-bundle-error';

import { ConstituentaTooltip } from '../../components/constituenta-tooltip';

import { RSFormTabs } from './rsform-tabs';
import { SchemaEditState } from './schema-edit-state';

const paramsSchema = z.strictObject({
  id: z.coerce.number(),
  version: z.coerce
    .number()
    .nullish()
    .transform(v => v ?? undefined),
  tab: z.preprocess(v => (v ? Number(v) : undefined), z.enum(RSTabID).default(RSTabID.CARD)),
  activeID: z.coerce
    .number()
    .nullish()
    .transform(v => v ?? undefined)
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

  if (!urlData.id) {
    router.replace({ path: urls.page404, force: true });
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
          <p>
            {isArchive
              ? tx('ui.rsform.error.notFoundVersion', 'Conceptual schema with this id and version was not found.')
              : tx('ui.rsform.error.notFound', 'Conceptual schema with this id was not found.')}
          </p>
          <div className='flex justify-center'>
            <TextURL text={tx('ui.nav.library', 'Library')} href='/library' />
            {isArchive ? <Divider vertical margins='mx-3' /> : null}
            {isArchive ? (
              <TextURL text={tx('ui.rsform.link.currentVersion', 'Current version')} href={`/rsforms/${itemID}`} />
            ) : null}
          </div>
        </div>
      );
    } else if (error.response.status === 403) {
      return (
        <div className='flex flex-col items-center p-2 mx-auto'>
          <p>{tx('ui.rsform.error.forbidden', 'The owner has restricted access to this schema.')}</p>
          <TextURL text={tx('ui.nav.library', 'Library')} href='/library' />
        </div>
      );
    }
  }
  throw error as Error;
}
