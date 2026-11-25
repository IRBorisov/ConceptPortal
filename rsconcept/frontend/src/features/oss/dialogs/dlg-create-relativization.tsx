'use client';

import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_LOCALE, useTx } from '@/i18n';
import { Grammeme } from '@rsconcept/domain/cctext/language';
import { type Constituenta, CstType, type Operation, type OperationType } from '@rsconcept/domain/library';

import { useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { DialogTourID } from '@/features/onboarding/tours/editor-tours';
import { endDialogTourIfActive } from '@/features/onboarding/utils/end-dialog-tour';
import { rsformsApi } from '@/features/rsform/backend/api';
import { cctextApi } from '@/features/rsform/backend/cctext/api';

import { isAxiosError } from '@/backend/api-transport';
import { KEYS } from '@/backend/configuration';
import { Label } from '@/components/input';
import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { limits } from '@/utils/constants';
import { extractErrorMessage } from '@/utils/utils';

import { ossApi, updateOss } from '../backend/api';
import { type RelativizationParametersDTO } from '../backend/types';
import { useOss } from '../backend/use-oss';
import { SelectBlock } from '../components/select-block';
import { SelectOperation } from '../components/select-operation';

import {
  getRelativizationExclusions,
  RelativizationParameterFields,
  RelativizationResultFields
} from './relativization/parameter-fields';
import { getRelativizationPlacement } from './relativization/placement';
import { canConfirmReview, hasReviewEdits, isReviewed, prepareReview, type ReviewRow } from './relativization/review';
import { ReviewRelativizationTexts } from './relativization/review-texts';
import { defaultContextNames, getRelativizationLocale } from './relativization/source-locale';
import { useOssDialogsStore } from './oss-dialog-store';

export interface DlgCreateRelativizationProps {
  ossID: number;
  initialSource: number | null;
  existingOperation?: Extract<Operation, { operation_type: typeof OperationType.RELATIVIZATION }>;
  initialParent: number | null;
  position: { x: number; y: number };
  onCreate: (newID: number) => void;
}

export function DlgCreateRelativization() {
  const tx = useTx();
  const client = useQueryClient();
  const router = useConceptNavigation();
  const intl = useIntl();
  const hideDialog = useOssDialogsStore(state => state.hideDialog);
  const props = useOssDialogsStore(state => state.props as DlgCreateRelativizationProps);
  const { schema: oss } = useOss({ itemID: props.ossID });
  const existing = props.existingOperation;
  const options = existing?.relativization?.parameters;
  const [sourceID, setSourceID] = useState(props.initialSource);
  const [parentID, setParentID] = useState(props.initialParent);
  const [targetID, setTargetID] = useState<number | null>(options?.target ?? null);
  const [excludedIDs, setExcludedIDs] = useState<number[]>(options?.excluded ?? []);
  const [manualTitle, setManualTitle] = useState<string | null>(existing?.title ?? null);
  const [alias, setAlias] = useState(existing?.alias ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [manualContext, setManualContext] = useState<string | null>(options?.context_name ?? null);
  const [step, setStep] = useState<'parameters' | 'review'>('parameters');
  const [draft, setDraft] = useState<{ parameters: RelativizationParametersDTO; revision: string } | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [pending, setPending] = useState<'preview' | 'save' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const pendingRef = useRef(false);

  const operations = oss.operations.filter(operation => operation.result !== null);
  const source = operations.find(operation => operation.id === sourceID) ?? null;
  const sourceQuery = useQuery(rsformsApi.getRSFormQueryOptions({ itemID: source?.result }));
  const schema = sourceQuery.data?.transformed;
  const targetOptions = (schema?.items ?? []).filter(
    item => item.cst_type === CstType.BASE || item.cst_type === CstType.STRUCTURED
  );
  const target = targetOptions.find(item => item.id === targetID) ?? null;
  const exclusionOptions = getRelativizationExclusions(schema?.items ?? [], target);

  const term = target?.term_resolved.trim() ?? '';
  const locale = getRelativizationLocale(sourceQuery.data?.raw, options?.locale ?? DEFAULT_LOCALE);
  const contextName = manualContext ?? defaultContextNames[locale];
  const canInflect = !!term && manualTitle === null && intl.locale === 'ru' && locale === 'ru';
  const formQuery = useQuery({
    queryKey: [KEYS.cctext, 'inflect', term, Grammeme.gent],
    queryFn: ({ signal }) => cctextApi.inflect({ text: term, grams: Grammeme.gent }, signal),
    enabled: canInflect,
    retry: false
  });
  const defaultTitle =
    schema && target
      ? tx('tx.oss.relativization.title', {
          source: schema.title || schema.alias,
          term: (canInflect ? formQuery.data?.result.trim() : undefined) || term || target.alias
        })
      : '';
  const title = manualTitle ?? defaultTitle;

  const create = useMutation({
    mutationKey: [ossApi.baseKey, 'create-relativization'],
    networkMode: 'always',
    retry: false,
    mutationFn: ossApi.createRelativization,
    onSuccess: async response => {
      updateOss(response.oss, client);
      await client.invalidateQueries({ queryKey: KEYS.composite.libraryList });
      props.onCreate(response.new_operation);
      endDialogTourIfActive(DialogTourID.CREATE_RELATIVIZATION);
      hideDialog();
      const resultId = response.oss.operations.find(operation => operation.id === response.new_operation)?.result;
      if (resultId != null) router.gotoCstList(resultId);
    }
  });

  const isWaitingForTitle = canInflect && formQuery.isLoading;
  const aliasTaken = oss.operations.some(
    operation => operation.id !== existing?.id && operation.alias === alias.trim()
  );
  const canPrepare =
    !!source &&
    !!schema &&
    !!target &&
    !!alias.trim() &&
    !!title.trim() &&
    !!contextName.trim() &&
    alias.length <= limits.len_alias &&
    title.length <= limits.len_title &&
    !aliasTaken &&
    !isWaitingForTitle;

  const sourceChanged = draft !== null && sourceQuery.data?.raw.time_update !== draft.parameters.source_time_update;
  const canConfirm = draft !== null && canPrepare && !sourceChanged && canConfirmReview(rows);

  function changeSource(operation: Operation | null) {
    setSourceID(operation?.id ?? null);
    setTargetID(null);
    setExcludedIDs([]);
  }

  function changeTarget(item: Constituenta | null) {
    setTargetID(item?.id ?? null);
    setExcludedIDs(previous => previous.filter(id => id !== item?.id));
  }

  function toggleExcluded(id: number, checked: boolean) {
    setExcludedIDs(previous => (checked ? [...previous, id] : previous.filter(item => item !== id)));
  }

  async function handleRequestError(error: unknown) {
    setErrorMessage(error instanceof Error ? extractErrorMessage(error) : tx('tx.oss.relativization.compute.fail'));
    if (isAxiosError(error) && error.response?.status === 409) {
      await Promise.all([
        client.invalidateQueries({ queryKey: ossApi.getOssQueryOptions({ itemID: oss.id }).queryKey }),
        sourceQuery.refetch()
      ]);
    }
  }

  async function submit() {
    const raw = sourceQuery.data?.raw;
    if (pendingRef.current || !canPrepare || !source || !target || !raw) return;

    pendingRef.current = true;
    setPending(step === 'parameters' ? 'preview' : 'save');
    setErrorMessage('');
    try {
      if (step === 'parameters') {
        const parameters = {
          ...(existing ? { existing_operation: existing.id } : {}),
          source_operation: source.id,
          source_time_update: raw.time_update,
          target: target.id,
          excluded: exclusionOptions.filter(item => excludedIDs.includes(item.id)).map(item => item.id),
          locale,
          context_name: contextName.trim()
        };
        const result = await ossApi.previewRelativization({
          itemID: oss.id,
          data: parameters,
          expectedTimeUpdate: oss.time_update
        });
        setRows(previous => prepareReview(result, draft?.parameters.source_operation === source.id ? previous : []));
        setDraft({ parameters, revision: result.revision });
        endDialogTourIfActive(DialogTourID.CREATE_RELATIVIZATION);
        setStep('review');
        return;
      }
      if (!canConfirm || !draft) return;
      const { layout, position, expectedTimeUpdate } = getRelativizationPlacement(
        oss,
        props.position,
        parentID,
        source.id,
        existing?.id
      );
      await create.mutateAsync({
        itemID: oss.id,
        expectedTimeUpdate,
        data: {
          ...draft.parameters,
          revision: draft.revision,
          reviewed: rows.filter(isReviewed).map(row => row.item.id),
          edits: rows.filter(hasReviewEdits).map(row => ({ id: row.item.id, clarified: row.clarified, ...row.fields })),
          item_data: { title: title.trim(), alias: alias.trim(), description, parent: parentID },
          layout,
          position
        }
      });
    } catch (error) {
      await handleRequestError(error);
    } finally {
      pendingRef.current = false;
      setPending(null);
    }
  }

  return (
    <ModalForm
      header={tx('tx.oss.relativization')}
      submitText={tx(
        step === 'parameters'
          ? 'tx.oss.relativization.review.start'
          : existing
            ? 'tx.oss.relativization.review.update'
            : 'tx.oss.relativization.review.submit'
      )}
      canSubmit={!pending && (step === 'parameters' ? canPrepare : canConfirm)}
      closeOnSubmit={false}
      beforeCancel={() => !pendingRef.current}
      onHide={hideDialog}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void submit();
      }}
      className={`${step === 'parameters' ? 'w-160' : 'w-224'} max-w-[calc(100svw-1.5rem)] px-3 sm:px-5`}
      helpTopic={HelpTopic.CC_RELATIVIZATION}
      openManualInNewTab
      tourID={step === 'parameters' ? DialogTourID.CREATE_RELATIVIZATION : undefined}
    >
      <div role='status' aria-live='polite'>
        {pending === 'preview'
          ? tx('tx.oss.relativization.review.previewing')
          : pending === 'save'
            ? tx('tx.oss.relativization.review.saving')
            : null}
      </div>
      {errorMessage ? (
        <p role='alert' className='mt-3 whitespace-pre-wrap text-destructive'>
          {errorMessage}
        </p>
      ) : null}
      {step === 'review' ? (
        <>
          {sourceChanged ? (
            <p role='alert' className='text-destructive'>
              {tx('tx.oss.relativization.review.stale')}
            </p>
          ) : null}
          <ReviewRelativizationTexts
            rows={rows}
            onChange={row => setRows(previous => previous.map(old => (old.item.id === row.item.id ? row : old)))}
            back={() => setStep('parameters')}
            disabled={pending !== null}
            locale={draft?.parameters.locale ?? locale}
          />
        </>
      ) : (
        <fieldset disabled={pending !== null} className='grid min-w-0 gap-4 py-3'>
          <div data-tour='relativization-parameters' className='grid min-w-0 gap-3'>
            <div data-tour='relativization-source' className='grid min-w-0 gap-2'>
              <Label text={tx('tx.oss.relocate.source')} htmlFor={existing ? undefined : 'relativization_source'} />
              {existing ? (
                <p id='relativization_source'>{source?.title || source?.alias}</p>
              ) : (
                <SelectOperation
                  id='relativization_source'
                  className='h-9 text-left [&_svg]:size-4'
                  items={operations}
                  value={source}
                  onChange={changeSource}
                />
              )}
            </div>
            {source && sourceQuery.isPending ? <Loader /> : null}
            {sourceQuery.isError ? (
              <p role='alert' className='text-destructive'>
                {tx('tx.oss.relativization.source.fail')}
              </p>
            ) : null}
            {schema ? (
              <RelativizationParameterFields
                targets={targetOptions}
                target={target}
                focusTarget={draft !== null}
                onTargetChange={changeTarget}
                contextName={contextName}
                maxContextLength={limits.len_alias}
                onContextNameChange={setManualContext}
                exclusions={exclusionOptions}
                excludedIDs={excludedIDs}
                onExcludedChange={toggleExcluded}
              />
            ) : null}
          </div>
          <RelativizationResultFields
            title={title}
            onTitleChange={setManualTitle}
            alias={alias}
            onAliasChange={setAlias}
            aliasError={aliasTaken ? tx('tx.lib.alias.validate.taken') : undefined}
            description={description}
            onDescriptionChange={setDescription}
          >
            {oss.blocks.length > 0 ? (
              <div>
                <Label text={tx('tx.oss.block.parent')} htmlFor='relativization_parent' className='sr-only' />
                <SelectBlock
                  id='relativization_parent'
                  className='h-9 w-full text-left [&_svg]:size-4'
                  items={oss.blocks}
                  value={parentID === null ? null : (oss.blockByID.get(parentID) ?? null)}
                  onChange={value => setParentID(value?.id ?? null)}
                  placeholder={tx('tx.oss.block.parent')}
                />
              </div>
            ) : null}
          </RelativizationResultFields>
        </fieldset>
      )}
    </ModalForm>
  );
}
