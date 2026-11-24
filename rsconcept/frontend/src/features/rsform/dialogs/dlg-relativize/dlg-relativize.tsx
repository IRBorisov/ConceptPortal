'use client';

import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';

import { useTx } from '@/i18n';
import { Grammeme } from '@rsconcept/domain/cctext/language';
import { CstType, LocationHead, type RSForm } from '@rsconcept/domain/library';

import { useConceptNavigation } from '@/app';
import { useAuth } from '@/features/auth/backend/use-auth';
import { HelpTopic } from '@/features/help';
import { useCreateFromSandbox } from '@/features/library/backend/use-create-from-sandbox';
import { DialogTourID } from '@/features/onboarding/tours/editor-tours';

import { Checkbox, Label, TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { limits } from '@/utils/constants';

import { cctextApi } from '../../backend/cctext/api';
import { SelectConstituenta } from '../../components/select-constituenta';
import { useRsformDialogsStore } from '../rsform-dialog-store';

import { makeRelativizedData } from './make-data';

export interface DlgRelativizeProps {
  schema: RSForm;
  initialTarget: number | null;
}

const KERNEL_TYPES = new Set<CstType>([CstType.BASE, CstType.CONSTANT, CstType.STRUCTURED]);

function resultLocation(schema: RSForm, userID: number | null): string {
  if (userID !== null && schema.owner === userID && schema.location !== LocationHead.LIBRARY) {
    return schema.location;
  }
  return userID !== null ? LocationHead.USER : LocationHead.COMMON;
}

export function DlgRelativize() {
  const tx = useTx();
  const router = useConceptNavigation();
  const { user } = useAuth();
  const { createRSFormFromSandbox } = useCreateFromSandbox();
  const props = useRsformDialogsStore(state => state.props as DlgRelativizeProps);
  const { schema } = props;
  const targetOptions = schema.items.filter(
    item => item.cst_type === CstType.BASE || item.cst_type === CstType.STRUCTURED
  );
  const [targetID, setTargetID] = useState<number | null>(
    targetOptions.some(item => item.id === props.initialTarget) ? props.initialTarget : null
  );
  const [excludedIDs, setExcludedIDs] = useState<number[]>([]);
  const [manualTitle, setManualTitle] = useState<string | null>(null);
  const [alias, setAlias] = useState('');
  const [description, setDescription] = useState('');
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  const target = targetOptions.find(item => item.id === targetID) ?? null;
  const exclusionOptions = schema.items.filter(item => item.id !== target?.id && KERNEL_TYPES.has(item.cst_type));
  const term = target?.term_resolved.trim() ?? '';
  const formQuery = useQuery({
    queryKey: [cctextApi.baseKey, 'inflect', term, Grammeme.gent],
    queryFn: ({ signal }) => cctextApi.inflect({ text: term, grams: Grammeme.gent }, signal),
    enabled: !!term && manualTitle === null,
    retry: false
  });
  const defaultTitle = target
    ? tx('tx.schema.relativization.title', {
        source: schema.title || schema.alias,
        term: formQuery.data?.result.trim() || term || target.alias
      })
    : '';
  const title = manualTitle ?? defaultTitle;
  const isWaitingForTitle = !!term && manualTitle === null && formQuery.isPending;
  const canSubmit =
    !!target &&
    !!alias.trim() &&
    !!title.trim() &&
    alias.length <= limits.len_alias &&
    title.length <= limits.len_title &&
    description.length <= limits.len_description &&
    !isWaitingForTitle;

  function changeTarget(item: (typeof targetOptions)[number] | null) {
    setTargetID(item?.id ?? null);
    setExcludedIDs(previous => previous.filter(id => id !== item?.id));
  }

  function toggleExcluded(id: number, checked: boolean) {
    setExcludedIDs(previous => (checked ? [...previous, id] : previous.filter(item => item !== id)));
  }

  async function submit(): Promise<boolean> {
    if (pendingRef.current || !canSubmit || !target) {
      return false;
    }
    pendingRef.current = true;
    setPending(true);
    try {
      const excluded = exclusionOptions.filter(item => excludedIDs.includes(item.id));
      let result;
      try {
        result = makeRelativizedData(
          schema,
          target.alias,
          excluded.map(item => item.alias)
        );
      } catch {
        toast.error(tx('tx.schema.relativization.compute.fail'));
        return false;
      }
      if (!result) {
        toast.error(tx('tx.schema.relativization.compute.fail'));
        return false;
      }
      const kept = new Set(result.items.map(item => item.id));
      try {
        const created = await createRSFormFromSandbox({
          item_data: {
            title: title.trim(),
            alias: alias.trim(),
            description: description.trim(),
            visible: true,
            read_only: false,
            access_policy: schema.access_policy,
            location: resultLocation(schema, user.id)
          },
          schema_data: {
            items: result.items,
            attribution: (result.attribution ?? []).filter(row => kept.has(row.container) && kept.has(row.attribute))
          }
        });
        router.gotoRSForm(created.id);
      } catch {
        return false;
      }
      return true;
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <ModalForm
      header={tx('tx.schema.relativization')}
      submitText={tx('tx.general.create')}
      canSubmit={canSubmit && !pending}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        return submit();
      }}
      className='w-180 px-6 h-128'
      helpTopic={HelpTopic.UI_SCHEMA_MENU}
      tourID={DialogTourID.CREATE_RELATIVIZATION}
    >
      <div className='cc-column pt-4'>
        <div data-tour='relativization-parameters' className='cc-column'>
          <div data-tour='relativization-target' className='cc-column'>
            <Label text={tx('tx.schema.relativization.target.field')} htmlFor='relativization_target' />
            <SelectConstituenta
              id='relativization_target'
              items={targetOptions}
              placeholder={tx('tx.schema.relativization.target.select')}
              value={target}
              onChange={changeTarget}
            />
          </div>
          {exclusionOptions.length > 0 ? (
            <fieldset className='grid gap-1'>
              <legend>{tx('tx.schema.relativization.excluded')}</legend>
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
            <TextInput
              id='relativization_alias'
              label={tx('tx.lib.alias')}
              placeholder={tx('tx.lib.alias.validate.empty')}
              value={alias}
              onChange={event => setAlias(event.target.value)}
              maxLength={limits.len_alias}
            />
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
