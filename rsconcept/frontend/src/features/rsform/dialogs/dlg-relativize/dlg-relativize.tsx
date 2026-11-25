'use client';

import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_LOCALE, useTx } from '@/i18n';
import { Grammeme } from '@rsconcept/domain/cctext/language';
import { type Constituenta, CstType, LocationHead } from '@rsconcept/domain/library';
import { type RelativizationProjection } from '@rsconcept/domain/library/relativization';

import { useConceptNavigation } from '@/app';
import { useAuth } from '@/features/auth/backend/use-auth';
import { HelpTopic } from '@/features/help';
import { useCreateFromSandbox } from '@/features/library/backend/use-create-from-sandbox';
import {
  getRelativizationExclusions,
  RelativizationParameterFields,
  RelativizationResultFields
} from '@/features/oss/dialogs/relativization/parameter-fields';
import { canConfirmReview, prepareReview, type ReviewRow } from '@/features/oss/dialogs/relativization/review';
import { ReviewRelativizationTexts } from '@/features/oss/dialogs/relativization/review-texts';
import { defaultContextNames, getRelativizationLocale } from '@/features/oss/dialogs/relativization/source-locale';

import { KEYS } from '@/backend/configuration';
import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { extractErrorMessage } from '@/utils/utils';

import { rsformsApi } from '../../backend/api';
import { cctextApi } from '../../backend/cctext/api';
import { useRsformDialogsStore } from '../rsform-dialog-store';

import { type RelativizationRequest } from './relativization.worker';

export interface DlgRelativizeProps {
  schemaID: number;
  initialTarget: number | null;
}

async function calculateDraft(request: RelativizationRequest): Promise<RelativizationProjection | null> {
  const worker = new Worker(new URL('./relativization.worker.ts', import.meta.url), { type: 'module' });
  try {
    return await new Promise<RelativizationProjection | null>((resolve, reject) => {
      worker.onmessage = ({ data }: MessageEvent<RelativizationProjection | null>) => resolve(data);
      worker.onerror = reject;
      worker.onmessageerror = reject;
      worker.postMessage(request);
    });
  } finally {
    worker.terminate();
  }
}

export function DlgRelativize() {
  const tx = useTx();
  const intl = useIntl();
  const router = useConceptNavigation();
  const { user } = useAuth();
  const { createRSFormFromSandbox } = useCreateFromSandbox({ reportErrorInDialog: true });
  const { schemaID, initialTarget } = useRsformDialogsStore(state => state.props as DlgRelativizeProps);
  const hideDialog = useRsformDialogsStore(state => state.hideDialog);
  const sourceQuery = useQuery(rsformsApi.getRSFormQueryOptions({ itemID: schemaID }));
  const source = sourceQuery.data?.raw;
  const schema = sourceQuery.data?.transformed;

  const [targetID, setTargetID] = useState(initialTarget);
  const [excludedIDs, setExcludedIDs] = useState<number[]>([]);
  const [manualTitle, setManualTitle] = useState<string | null>(null);
  const [alias, setAlias] = useState('');
  const [description, setDescription] = useState('');
  const [manualContext, setManualContext] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ projection: RelativizationProjection; sourceTime: string } | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const pendingRef = useRef(false);

  const targetOptions = (schema?.items ?? []).filter(
    item => item.cst_type === CstType.BASE || item.cst_type === CstType.STRUCTURED
  );
  const target = targetOptions.find(item => item.id === targetID) ?? null;
  const exclusionOptions = getRelativizationExclusions(schema?.items ?? [], target);
  const term = target?.term_resolved.trim() ?? '';
  const locale = getRelativizationLocale(source, DEFAULT_LOCALE);
  const contextName = manualContext ?? defaultContextNames[locale];
  const useInflection = intl.locale === 'ru' && locale === 'ru' && !!term && manualTitle === null;
  const formQuery = useQuery({
    queryKey: [KEYS.cctext, 'inflect', term, Grammeme.gent],
    queryFn: ({ signal }) => cctextApi.inflect({ text: term, grams: Grammeme.gent }, signal),
    enabled: useInflection,
    retry: false
  });
  const inflected = useInflection ? formQuery.data?.result.trim() : '';
  const defaultTitle =
    schema && target
      ? tx('tx.oss.relativization.title', {
          source: schema.title || schema.alias,
          term: inflected || term || target.alias
        })
      : '';
  const title = manualTitle ?? defaultTitle;
  const canPrepare =
    !!source &&
    !!target &&
    !!alias.trim() &&
    !!title.trim() &&
    !!contextName.trim() &&
    !(useInflection && formQuery.isLoading);
  const sourceChanged = draft !== null && draft.sourceTime !== source?.time_update;
  const canConfirm = draft !== null && !sourceChanged && canConfirmReview(rows);

  function changeTarget(item: Constituenta | null) {
    setTargetID(item?.id ?? null);
    setExcludedIDs(previous => previous.filter(id => id !== item?.id));
  }

  function toggleExcluded(id: number, checked: boolean) {
    setExcludedIDs(previous => (checked ? [...previous, id] : previous.filter(item => item !== id)));
  }

  async function submit() {
    if (pendingRef.current || !canPrepare || !source || !target || (reviewing && !canConfirm)) return;
    pendingRef.current = true;
    setPending(true);
    setErrorMessage('');
    try {
      if (!reviewing) {
        const projection = await calculateDraft({
          source: { items: source.items, attribution: source.attribution },
          options: {
            target: target.id,
            excluded: exclusionOptions.filter(item => excludedIDs.includes(item.id)).map(item => item.id),
            locale,
            contextName: contextName.trim()
          }
        });
        if (!projection) {
          setErrorMessage(tx('tx.oss.relativization.compute.fail'));
          return;
        }
        setRows(prepareReview(projection, rows));
        setDraft({ projection, sourceTime: source.time_update });
        setReviewing(true);
        return;
      }
      if (!draft) return;
      const reviewedFields = new Map(rows.map(row => [row.item.id, row.fields]));
      const result = await createRSFormFromSandbox({
        item_data: {
          title: title.trim(),
          alias: alias.trim(),
          description: description.trim(),
          visible: true,
          read_only: false,
          access_policy: source.access_policy,
          location:
            user.id === source.owner && source.location !== LocationHead.LIBRARY ? source.location : LocationHead.USER
        },
        schema_data: {
          items: draft.projection.items.map(item => {
            const fields = reviewedFields.get(item.id);
            return fields
              ? { ...item, ...fields, term_forms: fields.term_raw === item.term_raw ? item.term_forms : [] }
              : item;
          }),
          attribution: draft.projection.attribution
        }
      });
      hideDialog();
      router.gotoCstList(result.id);
    } catch (error) {
      setErrorMessage(
        reviewing && error instanceof Error ? extractErrorMessage(error) : tx('tx.oss.relativization.compute.fail')
      );
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <ModalForm
      header={tx('tx.oss.relativization')}
      submitText={tx(reviewing ? 'tx.oss.relativization.review.submit' : 'tx.oss.relativization.review.start')}
      canSubmit={!pending && canPrepare && (!reviewing || canConfirm)}
      beforeCancel={() => !pendingRef.current}
      closeOnSubmit={false}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void submit();
      }}
      className={`${reviewing ? 'w-224' : 'w-160'} max-w-[calc(100svw-1.5rem)] px-3 sm:px-5`}
      helpTopic={HelpTopic.CC_RELATIVIZATION}
      openManualInNewTab
    >
      {errorMessage ? (
        <p className='pt-3 text-destructive' role='alert'>
          {errorMessage}
        </p>
      ) : null}
      {pending ? (
        <p className='pt-3' role='status'>
          {tx(reviewing ? 'tx.oss.relativization.review.saving' : 'tx.oss.relativization.review.previewing')}
        </p>
      ) : null}
      {sourceQuery.isPending ? <Loader /> : null}
      {sourceQuery.isError && !source ? <p role='alert'>{tx('tx.oss.relativization.source.fail')}</p> : null}
      {reviewing ? (
        <>
          {sourceChanged ? <p role='alert'>{tx('tx.oss.relativization.review.stale')}</p> : null}
          <ReviewRelativizationTexts
            rows={rows}
            onChange={row => setRows(current => current.map(item => (item.item.id === row.item.id ? row : item)))}
            back={() => {
              setErrorMessage('');
              setReviewing(false);
            }}
            disabled={pending}
            locale={locale}
          />
        </>
      ) : (
        <fieldset className='grid min-w-0 gap-4 py-3' disabled={pending}>
          <RelativizationParameterFields
            targets={targetOptions}
            target={target}
            focusTarget={draft !== null}
            onTargetChange={changeTarget}
            contextName={contextName}
            onContextNameChange={setManualContext}
            exclusions={exclusionOptions}
            excludedIDs={excludedIDs}
            onExcludedChange={toggleExcluded}
          />
          <RelativizationResultFields
            title={title}
            onTitleChange={setManualTitle}
            alias={alias}
            onAliasChange={setAlias}
            description={description}
            onDescriptionChange={setDescription}
          />
        </fieldset>
      )}
    </ModalForm>
  );
}
