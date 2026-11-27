'use client';

import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_LOCALE, useTx } from '@/i18n';
import { Grammeme } from '@rsconcept/domain/cctext/language';
import { type Constituenta, CstType, type Operation, type OperationType } from '@rsconcept/domain/library';

import { useConceptNavigation } from '@/app';
import { DialogTourID } from '@/features/onboarding/tours/editor-tours';
import { endDialogTourIfActive } from '@/features/onboarding/utils/end-dialog-tour';
import {
  getRelativizationExclusions,
  RelativizationParameterFields,
  RelativizationResultFields
} from '@/features/relativization/components/parameter-fields';
import { RelativizationDialog } from '@/features/relativization/components/relativization-dialog';
import { getRelativizationLocale } from '@/features/relativization/models/source-locale';
import { rsformsApi } from '@/features/rsform/backend/api';
import { cctextApi } from '@/features/rsform/backend/cctext/api';

import { isAxiosError } from '@/backend/api-transport';
import { KEYS } from '@/backend/configuration';
import { Label } from '@/components/input';
import { Loader } from '@/components/loader';
import { limits } from '@/utils/constants';
import { extractErrorMessage } from '@/utils/utils';

import { ossApi, updateOss } from '../backend/api';
import { useOss } from '../backend/use-oss';
import { SelectBlock } from '../components/select-block';
import { SelectOperation } from '../components/select-operation';

import { getRelativizationPlacement } from './relativization/placement';
import { useOssDialogsStore } from './oss-dialog-store';

export interface DlgCreateRelativizationProps {
  ossID: number;
  initialSource: number | null;
  returnFocusTo: HTMLElement | null;
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
  const [contextName, setContextName] = useState(options?.context_name ?? '');
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const pendingRef = useRef(false);
  const sourceField = useRef<HTMLDivElement>(null);

  useEffect(
    function focusSource() {
      if (sourceID === null) {
        sourceField.current?.querySelector<HTMLButtonElement>('#relativization_source')?.focus();
      }
    },
    [sourceID]
  );

  const operations = oss.operations.filter(operation => operation.result !== null);
  const source = operations.find(operation => operation.id === sourceID) ?? null;
  const parent = parentID === null ? null : (oss.blockByID.get(parentID) ?? null);
  const sourceQuery = useQuery(rsformsApi.getRSFormQueryOptions({ itemID: source?.result }));
  const schema = sourceQuery.data?.transformed;
  const targetOptions = (schema?.items ?? []).filter(
    item => item.cst_type === CstType.BASE || item.cst_type === CstType.STRUCTURED
  );
  const target = targetOptions.find(item => item.id === targetID) ?? null;
  const exclusionOptions = getRelativizationExclusions(schema?.items ?? [], target);

  const term = target?.term_resolved.trim() ?? '';
  const locale = getRelativizationLocale(sourceQuery.data?.raw, options?.locale ?? DEFAULT_LOCALE);
  const familyName = contextName.trim();
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
    !!familyName &&
    !!alias.trim() &&
    !!title.trim() &&
    alias.length <= limits.len_alias &&
    title.length <= limits.len_title &&
    !aliasTaken &&
    !isWaitingForTitle;

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
    setPending(true);
    setErrorMessage('');
    try {
      const parameters = {
        ...(existing ? { existing_operation: existing.id } : {}),
        source_operation: source.id,
        source_time_update: raw.time_update,
        target: target.id,
        excluded: exclusionOptions.filter(item => excludedIDs.includes(item.id)).map(item => item.id),
        locale,
        context_name: familyName
      };
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
          ...parameters,
          item_data: { title: title.trim(), alias: alias.trim(), description, parent: parentID },
          layout,
          position
        }
      });
    } catch (error) {
      await handleRequestError(error);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <RelativizationDialog
      updating={!!existing}
      pending={pending}
      canSubmit={canPrepare}
      errorMessage={errorMessage}
      returnFocusTo={props.returnFocusTo}
      beforeCancel={() => !pendingRef.current}
      onHide={hideDialog}
      onSubmit={() => void submit()}
      tourID={DialogTourID.CREATE_RELATIVIZATION}
    >
      <fieldset disabled={pending} className='grid min-w-0 gap-4 py-3'>
        <div data-tour='relativization-parameters' className='grid min-w-0 gap-3'>
          <div ref={sourceField} data-tour='relativization-source' className='grid min-w-0 gap-2'>
            <Label
              text={tx('tx.oss.relocate.source')}
              htmlFor={existing ? undefined : 'relativization_source'}
              className={existing ? undefined : 'sr-only'}
            />
            {existing ? (
              <p id='relativization_source' className='wrap-anywhere'>
                {source?.title || source?.alias}
              </p>
            ) : (
              <SelectOperation
                id='relativization_source'
                className='h-9 w-full min-w-0 text-left [&_svg]:size-4'
                items={operations}
                placeholder={tx('tx.oss.relocate.source')}
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
              onTargetChange={changeTarget}
              contextName={contextName}
              maxContextLength={limits.len_alias}
              onContextNameChange={setContextName}
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
                className='h-9 w-full min-w-0 text-left [&_svg]:size-4'
                items={oss.blocks}
                value={parent}
                onChange={value => setParentID(value?.id ?? null)}
                placeholder={tx('tx.oss.block.parent')}
              />
            </div>
          ) : null}
        </RelativizationResultFields>
      </fieldset>
    </RelativizationDialog>
  );
}
