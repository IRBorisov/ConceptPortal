'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useTx } from '@/i18n';
import { Grammeme } from '@rsconcept/domain/cctext/language';
import { type Constituenta, CstType, type Operation, type OssLayout } from '@rsconcept/domain/library';
import { LayoutManager, OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '@rsconcept/domain/library/oss-layout-api';

import { HelpTopic } from '@/features/help';
import { DialogTourID } from '@/features/onboarding/tours/editor-tours';
import { rsformsApi } from '@/features/rsform/backend/api';
import { cctextApi } from '@/features/rsform/backend/cctext/api';
import { SelectConstituenta } from '@/features/rsform/components/select-constituenta';

import { KEYS } from '@/backend/configuration';
import { Checkbox, Label, TextArea, TextInput } from '@/components/input';
import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { limits } from '@/utils/constants';

import { ossApi, updateOss } from '../backend/api';
import { useOss } from '../backend/use-oss';
import { SelectOperation } from '../components/select-operation';
import { SelectParent } from '../components/select-parent';

import { useOssDialogsStore } from './oss-dialog-store';

export interface DlgCreateRelativizationProps {
  ossID: number;
  layout: OssLayout;
  initialSource: number | null;
  initialParent: number | null;
  position: { x: number; y: number };
  onCreate: (newID: number) => void;
}

const KERNEL_TYPES = new Set<CstType>([CstType.BASE, CstType.CONSTANT, CstType.STRUCTURED]);

export function DlgCreateRelativization() {
  const tx = useTx();
  const client = useQueryClient();
  const props = useOssDialogsStore(state => state.props as DlgCreateRelativizationProps);
  const { schema: oss } = useOss({ itemID: props.ossID });
  const [sourceID, setSourceID] = useState(props.initialSource);
  const [parentID, setParentID] = useState(props.initialParent);
  const [targetID, setTargetID] = useState<number | null>(null);
  const [excludedIDs, setExcludedIDs] = useState<number[]>([]);
  const [manualTitle, setManualTitle] = useState<string | null>(null);
  const [alias, setAlias] = useState('');
  const [description, setDescription] = useState('');

  const operations = oss.operations.filter(operation => operation.result !== null);
  const source = operations.find(operation => operation.id === sourceID) ?? null;
  const sourceQuery = useQuery(rsformsApi.getRSFormQueryOptions({ itemID: source?.result }));
  const schema = sourceQuery.data?.transformed;
  const targetOptions = (schema?.items ?? []).filter(
    item => item.cst_type === CstType.BASE || item.cst_type === CstType.STRUCTURED
  );
  const target = targetOptions.find(item => item.id === targetID) ?? null;
  const exclusionOptions = (schema?.items ?? []).filter(
    item => item.id !== target?.id && KERNEL_TYPES.has(item.cst_type)
  );

  const term = target?.term_resolved.trim() ?? '';
  const formQuery = useQuery({
    queryKey: [KEYS.cctext, 'inflect', term, Grammeme.gent],
    queryFn: ({ signal }) => cctextApi.inflect({ text: term, grams: Grammeme.gent }, signal),
    enabled: !!term && manualTitle === null,
    retry: false
  });
  const defaultTitle =
    schema && target
      ? tx('tx.oss.relativization.title', {
          source: schema.title || schema.alias,
          term: formQuery.data?.result.trim() || term || target.alias
        })
      : '';
  const title = manualTitle ?? defaultTitle;

  const create = useMutation({
    mutationKey: [KEYS.global_mutation, ossApi.baseKey, 'create-relativization'],
    mutationFn: ossApi.createRelativization,
    onSuccess: async response => {
      updateOss(response.oss, client);
      await client.invalidateQueries({ queryKey: KEYS.composite.libraryList });
      props.onCreate(response.new_operation);
    },
    onError: () => client.invalidateQueries()
  });

  const isWaitingForTitle = !!term && manualTitle === null && formQuery.isPending;
  const canSubmit =
    !!source &&
    !!schema &&
    !!target &&
    !!alias.trim() &&
    !!title.trim() &&
    alias.length <= limits.len_alias &&
    title.length <= limits.len_title &&
    !oss.operations.some(operation => operation.alias === alias.trim()) &&
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

  async function submit() {
    const raw = sourceQuery.data?.raw;
    if (!canSubmit || !source || !target || !raw) {
      return;
    }

    const excluded = exclusionOptions.filter(item => excludedIDs.includes(item.id));
    try {
      const { makeRelativizedData } = await import('./relativization/make-data');
      const result = makeRelativizedData(
        raw,
        target.alias,
        excluded.map(item => item.alias)
      );
      if (!result) {
        toast.error(tx('tx.oss.relativization.compute.fail'));
        return;
      }
      const layout = new LayoutManager(oss, props.layout);
      const position = layout.newOperationPosition(
        { ...props.position, width: OPERATION_NODE_WIDTH, height: OPERATION_NODE_HEIGHT },
        parentID,
        [source.id]
      );
      void create
        .mutateAsync({
          itemID: oss.id,
          data: {
            ...result,
            source_operation: source.id,
            source_time_update: raw.time_update,
            target: target.id,
            excluded: excluded.map(item => item.id),
            item_data: { title: title.trim(), alias: alias.trim(), description, parent: parentID },
            layout: layout.layout,
            position
          }
        })
        .catch(() => undefined);
    } catch {
      toast.error(tx('tx.oss.relativization.compute.fail'));
    }
  }

  return (
    <ModalForm
      header={tx('tx.oss.relativization')}
      submitText={tx('tx.general.create')}
      canSubmit={canSubmit}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void submit();
      }}
      className='w-180 px-6 h-128'
      helpTopic={HelpTopic.CC_OSS}
      tourID={DialogTourID.CREATE_RELATIVIZATION}
    >
      <div className='cc-column pt-4'>
        <div data-tour='relativization-parameters' className='cc-column'>
          <div data-tour='relativization-source' className='cc-column'>
            <Label text={tx('tx.oss.relocate.source')} htmlFor='relativization_source' />
            <SelectOperation id='relativization_source' items={operations} value={source} onChange={changeSource} />
          </div>
          {source && sourceQuery.isPending ? <Loader /> : null}
          {sourceQuery.isError ? (
            <p role='alert' className='text-destructive'>
              {tx('tx.oss.relativization.source.fail')}
            </p>
          ) : null}
          {schema ? (
            <>
              <Label text={tx('tx.oss.relativization.target.field')} htmlFor='relativization_target' />
              <SelectConstituenta
                id='relativization_target'
                items={targetOptions}
                placeholder={tx('tx.oss.relativization.target.select')}
                value={target}
                onChange={changeTarget}
              />
              {exclusionOptions.length > 0 ? (
                <fieldset className='grid gap-1'>
                  <legend>{tx('tx.oss.relativization.excluded')}</legend>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-36 overflow-auto'>
                    {exclusionOptions.map(item => (
                      <Checkbox
                        key={item.id}
                        label={[item.alias, item.term_resolved].filter(Boolean).join(' — ')}
                        role='checkbox'
                        aria-checked={excludedIDs.includes(item.id)}
                        value={excludedIDs.includes(item.id)}
                        onChange={value => toggleExcluded(item.id, value)}
                      />
                    ))}
                  </div>
                </fieldset>
              ) : null}
            </>
          ) : null}
        </div>
        <div data-tour='relativization-result' className='cc-column'>
          <TextInput
            id='relativization_title'
            label={tx('tx.lib.title')}
            value={title}
            onChange={event => setManualTitle(event.target.value)}
            maxLength={limits.len_title}
          />
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='grid gap-1'>
              <TextInput
                id='relativization_alias'
                label={tx('tx.lib.alias')}
                placeholder={tx('tx.lib.alias.validate.empty')}
                value={alias}
                onChange={event => setAlias(event.target.value)}
                maxLength={limits.len_alias}
                error={
                  oss.operations.some(operation => operation.alias === alias.trim())
                    ? tx('tx.lib.alias.validate.taken')
                    : undefined
                }
              />
              <SelectParent
                items={oss.blocks}
                value={parentID === null ? null : (oss.blockByID.get(parentID) ?? null)}
                onChange={value => setParentID(value?.id ?? null)}
                placeholder={tx('tx.oss.block.parent')}
              />
            </div>
            <TextArea
              id='relativization_description'
              className='w-full'
              label={tx('tx.lib.description')}
              value={description}
              onChange={event => setDescription(event.target.value)}
              maxLength={limits.len_description}
              rows={3}
              noResize
            />
          </div>
        </div>
      </div>
    </ModalForm>
  );
}
