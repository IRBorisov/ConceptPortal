'use client';

import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { DEFAULT_LOCALE, useTx } from '@/i18n';
import { Grammeme } from '@rsconcept/domain/cctext/language';
import { type Constituenta, CstType } from '@rsconcept/domain/library';

import { useConceptNavigation } from '@/app';
import { notifyLibrarySync } from '@/features/library/backend/library-sync';
import { type RelativizationParametersDTO } from '@/features/relativization';
import {
  getRelativizationExclusions,
  RelativizationParameterFields,
  RelativizationResultFields
} from '@/features/relativization/components/parameter-fields';
import {
  type RelativizationAction,
  RelativizationDialog
} from '@/features/relativization/components/relativization-dialog';
import { ReviewRelativizationTexts } from '@/features/relativization/components/review-texts';
import {
  canConfirmReview,
  hasEditedReviewTexts,
  hasReviewEdits,
  isReviewed,
  prepareReview,
  type ReviewRow
} from '@/features/relativization/models/review';
import { defaultContextNames, getRelativizationLocale } from '@/features/relativization/models/source-locale';

import { KEYS } from '@/backend/configuration';
import { Loader } from '@/components/loader';
import { extractErrorMessage } from '@/utils/utils';

import { rsformsApi } from '../../backend/api';
import { cctextApi } from '../../backend/cctext/api';
import { useRsformDialogsStore } from '../rsform-dialog-store';

export interface DlgRelativizeProps {
  schemaID: number;
  returnFocusTo: HTMLElement | null;
}

export function DlgRelativize() {
  const tx = useTx();
  const intl = useIntl();
  const router = useConceptNavigation();
  const client = useQueryClient();
  const { schemaID, returnFocusTo } = useRsformDialogsStore(state => state.props as DlgRelativizeProps);
  const hideDialog = useRsformDialogsStore(state => state.hideDialog);
  const sourceQuery = useQuery(rsformsApi.getRSFormQueryOptions({ itemID: schemaID }));
  const create = useMutation({
    mutationKey: [rsformsApi.baseKey, 'create-relativization'],
    networkMode: 'always',
    retry: false,
    mutationFn: rsformsApi.createRelativization,
    onSuccess: () => {
      notifyLibrarySync();
      return client.invalidateQueries({ queryKey: [KEYS.library] });
    }
  });
  const source = sourceQuery.data?.raw;
  const schema = sourceQuery.data?.transformed;

  const [targetID, setTargetID] = useState<number | null>(null);
  const [excludedIDs, setExcludedIDs] = useState<number[]>([]);
  const [manualTitle, setManualTitle] = useState<string | null>(null);
  const [alias, setAlias] = useState('');
  const [description, setDescription] = useState('');
  const [contextName, setContextName] = useState('');
  const [draft, setDraft] = useState<{ parameters: RelativizationParametersDTO; revision: string } | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [pending, setPending] = useState<RelativizationAction | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const pendingRef = useRef(false);

  const targetOptions = (schema?.items ?? []).filter(
    item => item.cst_type === CstType.BASE || item.cst_type === CstType.STRUCTURED
  );
  const target = targetOptions.find(item => item.id === targetID) ?? null;
  const exclusionOptions = getRelativizationExclusions(schema?.items ?? [], target);
  const term = target?.term_resolved.trim() ?? '';
  const locale = getRelativizationLocale(source, DEFAULT_LOCALE);
  const defaultContextName = defaultContextNames[locale];
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
    !!source && !!target && !!alias.trim() && !!title.trim() && !(useInflection && formQuery.isLoading);
  const sourceChanged = draft !== null && draft.parameters.source_time_update !== source?.time_update;
  const canConfirm = draft !== null && !sourceChanged && canConfirmReview(rows);

  function changeTarget(item: Constituenta | null) {
    setTargetID(item?.id ?? null);
    setExcludedIDs(previous => previous.filter(id => id !== item?.id));
  }

  function toggleExcluded(id: number, checked: boolean) {
    setExcludedIDs(previous => (checked ? [...previous, id] : previous.filter(item => item !== id)));
  }

  async function submit(action: RelativizationAction) {
    if (pendingRef.current || !canPrepare || !source || !target || (reviewing && !canConfirm)) return;
    pendingRef.current = true;
    setPending(action);
    setErrorMessage('');
    try {
      const reviewedDraft = reviewing ? draft : null;
      const parameters = reviewedDraft?.parameters ?? {
        source_time_update: source.time_update,
        target: target.id,
        excluded: exclusionOptions.filter(item => excludedIDs.includes(item.id)).map(item => item.id),
        locale,
        context_name: contextName.trim() || defaultContextName
      };
      if (action === 'preview') {
        const projection = await rsformsApi.previewRelativization({ itemID: schemaID, data: parameters });
        setRows(previous => prepareReview(projection, previous));
        setDraft({ parameters, revision: projection.revision });
        setReviewing(true);
        return;
      }
      const result = await create.mutateAsync({
        itemID: schemaID,
        data: {
          ...parameters,
          ...(reviewedDraft
            ? {
                revision: reviewedDraft.revision,
                reviewed: rows.filter(isReviewed).map(row => row.item.id),
                edits: rows
                  .filter(hasReviewEdits)
                  .map(row => ({ id: row.item.id, clarified: row.clarified, ...row.fields }))
              }
            : { skip_review: true }),
          item_data: { title: title.trim(), alias: alias.trim(), description: description.trim() }
        }
      });
      hideDialog();
      router.gotoCstList(result.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? extractErrorMessage(error) : tx('tx.oss.relativization.compute.fail'));
      if (isAxiosError(error) && error.response?.status === 409) {
        await sourceQuery.refetch();
      }
    } finally {
      pendingRef.current = false;
      setPending(null);
    }
  }

  function handleSecondaryAction() {
    if (reviewing) {
      setErrorMessage('');
      setReviewing(false);
    } else {
      void submit('preview');
    }
  }

  return (
    <RelativizationDialog
      reviewing={reviewing}
      pending={pending}
      canSubmit={canPrepare && (!reviewing || canConfirm)}
      hasEditedTexts={hasEditedReviewTexts(rows)}
      errorMessage={errorMessage}
      returnFocusTo={returnFocusTo}
      beforeCancel={() => !pendingRef.current}
      onHide={hideDialog}
      onSubmit={() => void submit('save')}
      onSecondaryAction={handleSecondaryAction}
    >
      {sourceQuery.isPending ? <Loader /> : null}
      {sourceQuery.isError && !source ? (
        <p className='py-3 text-destructive' role='alert'>
          {tx('tx.oss.relativization.source.fail')}
        </p>
      ) : null}
      {reviewing ? (
        <>
          {sourceChanged ? <p role='alert'>{tx('tx.oss.relativization.review.stale')}</p> : null}
          <ReviewRelativizationTexts
            rows={rows}
            onChange={row => setRows(current => current.map(item => (item.item.id === row.item.id ? row : item)))}
            disabled={!!pending}
            locale={locale}
          />
        </>
      ) : schema ? (
        <fieldset className='grid min-w-0 gap-4 py-3' disabled={!!pending}>
          <RelativizationParameterFields
            targets={targetOptions}
            target={target}
            onTargetChange={changeTarget}
            contextName={contextName}
            onContextNameChange={setContextName}
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
      ) : null}
    </RelativizationDialog>
  );
}
