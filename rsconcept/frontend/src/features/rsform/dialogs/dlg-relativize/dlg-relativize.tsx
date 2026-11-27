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
import {
  getRelativizationExclusions,
  RelativizationParameterFields,
  RelativizationResultFields
} from '@/features/relativization/components/parameter-fields';
import { RelativizationDialog } from '@/features/relativization/components/relativization-dialog';
import { getRelativizationLocale } from '@/features/relativization/models/source-locale';

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
  const familyName = contextName.trim();
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
    !!source && !!target && !!familyName && !!alias.trim() && !!title.trim() && !(useInflection && formQuery.isLoading);

  function changeTarget(item: Constituenta | null) {
    setTargetID(item?.id ?? null);
    setExcludedIDs(previous => previous.filter(id => id !== item?.id));
  }

  function toggleExcluded(id: number, checked: boolean) {
    setExcludedIDs(previous => (checked ? [...previous, id] : previous.filter(item => item !== id)));
  }

  async function submit() {
    if (pendingRef.current || !canPrepare || !source || !target) return;
    pendingRef.current = true;
    setPending(true);
    setErrorMessage('');
    try {
      const parameters = {
        source_time_update: source.time_update,
        target: target.id,
        excluded: exclusionOptions.filter(item => excludedIDs.includes(item.id)).map(item => item.id),
        locale,
        context_name: familyName
      };
      const result = await create.mutateAsync({
        itemID: schemaID,
        data: {
          ...parameters,
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
      setPending(false);
    }
  }

  return (
    <RelativizationDialog
      pending={pending}
      canSubmit={canPrepare}
      errorMessage={errorMessage}
      returnFocusTo={returnFocusTo}
      beforeCancel={() => !pendingRef.current}
      onHide={hideDialog}
      onSubmit={() => void submit()}
    >
      {sourceQuery.isPending ? <Loader /> : null}
      {sourceQuery.isError && !source ? (
        <p className='py-3 text-destructive' role='alert'>
          {tx('tx.oss.relativization.source.fail')}
        </p>
      ) : null}
      {schema ? (
        <fieldset className='grid min-w-0 gap-4 py-3' disabled={pending}>
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
