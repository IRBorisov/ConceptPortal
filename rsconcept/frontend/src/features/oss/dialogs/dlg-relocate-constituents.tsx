'use client';

import { useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { type LibraryItem, type OssLayout } from '@/domain/library';
import { getRelocateCandidates } from '@/domain/library/oss-api';

import { HelpTopic } from '@/features/help';
import { useLibrary } from '@/features/library/backend/use-library';
import { SelectLibraryItem } from '@/features/library/components/select-library-item';
import { useRSForm } from '@/features/rsform/backend/use-rsform';
import { PickMultiConstituenta } from '@/features/rsform/components/pick-multi-constituenta';

import { MiniButton } from '@/components/control';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { type RelocateConstituentsDTO, schemaRelocateConstituents } from '../backend/types';
import { useOss } from '../backend/use-oss';
import { useRelocateConstituents } from '../backend/use-relocate-constituents';
import { useUpdateLayout } from '../backend/use-update-layout';
import { IconRelocationUp } from '../components/icon-relocation-up';

export interface DlgRelocateConstituentsProps {
  ossID: number;
  targetID?: number;
  layout?: OssLayout;
}

export function DlgRelocateConstituents() {
  const { ossID, targetID, layout } = useDialogsStore(state => state.props as DlgRelocateConstituentsProps);
  const { items: libraryItems } = useLibrary();
  const { updateLayout: updatePositions } = useUpdateLayout();
  const { relocateConstituents } = useRelocateConstituents();

  const { schema: oss } = useOss({ itemID: ossID });
  const initialTarget = targetID ? oss.operationByID.get(targetID)! : undefined;

  const defaultValues: RelocateConstituentsDTO = {
    destination: null,
    items: []
  };
  const form = useForm({
    defaultValues,
    validators: {
      onChange: schemaRelocateConstituents
    },
    onSubmit: async ({ value }) => {
      const data = { ...value, items: moveTarget };
      if (!layout || JSON.stringify(layout) === JSON.stringify(oss.layout)) {
        await relocateConstituents({ itemID: oss.id, data });
      } else {
        await updatePositions({
          isSilent: true,
          itemID: oss.id,
          data: layout
        }).then(() => relocateConstituents({ itemID: oss.id, data }));
      }
    }
  });

  const selected = useStore(form.store, state => state.values.items);
  const destination = useStore(form.store, state => state.values.destination as number | null | undefined);
  const destinationItem = destination ? (libraryItems.find(item => item.id === destination) ?? null) : null;

  const [directionUp, setDirectionUp] = useState(true);
  const [source, setSource] = useState<LibraryItem | null>(
    libraryItems.find(item => item.id === initialTarget?.result) ?? null
  );

  const operation = oss.operations.find(item => item.result === source?.id);
  const sourceSchemas = libraryItems.filter(item => oss.schemas.includes(item.id));
  const destinationSchemas = (() => {
    if (!operation) {
      return [];
    }
    const node = oss.graph.at(operation.id)!;
    const schemaIds: number[] = directionUp
      ? node.inputs.map(id => oss.operationByID.get(id)!.result).filter(id => id !== null)
      : node.outputs.map(id => oss.operationByID.get(id)!.result).filter(id => id !== null);
    return schemaIds.map(id => libraryItems.find(item => item.id === id)).filter(item => item !== undefined);
  })();

  const sourceData = useRSForm({ itemID: source?.id });
  const filteredConstituents = (() => {
    if (!sourceData.schema || !destinationItem || !operation) {
      return [];
    }
    const destinationOperation = oss.operations.find(item => item.result === destination);
    return getRelocateCandidates(operation.id, destinationOperation!.id, sourceData.schema, oss);
  })();

  const moveTarget = filteredConstituents
    .filter(item => !item.is_inherited && selected.includes(item.id))
    .map(item => item.id);
  const isValid = moveTarget.length > 0;
  const canSubmit = isValid && destinationItem !== undefined;

  function toggleDirection() {
    setDirectionUp(prev => !prev);
    form.setFieldValue('destination', null);
  }

  function handleSelectSource(newValue: LibraryItem | null) {
    setSource(newValue);
    form.setFieldValue('destination', null);
    form.setFieldValue('items', []);
  }

  function handleSelectDestination(newValue: LibraryItem | null) {
    if (newValue) {
      form.setFieldValue('destination', newValue.id);
    } else {
      form.setFieldValue('destination', null);
    }
    form.setFieldValue('items', []);
  }

  return (
    <ModalForm
      header='Перенос конституент'
      submitText='Переместить'
      canSubmit={canSubmit}
      validationHint={canSubmit ? '' : hintMsg.relocateEmpty}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-160 h-132 py-3 px-6'
      helpTopic={HelpTopic.UI_RELOCATE_CST}
    >
      <div className='flex flex-col border'>
        <div className='flex justify-between gap-1 items-center bg-input border-b rounded-t-md max-w-full'>
          <SelectLibraryItem
            noBorder
            className='w-69'
            placeholder='Исходная схема'
            items={sourceSchemas}
            value={source}
            onChange={handleSelectSource}
          />
          <MiniButton
            title='Направление перемещения'
            icon={<IconRelocationUp value={directionUp} />}
            onClick={toggleDirection}
          />
          <SelectLibraryItem
            noBorder
            className='w-69'
            placeholder='Целевая схема'
            items={destinationSchemas}
            value={destinationItem}
            onChange={handleSelectDestination}
          />
        </div>
        <form.Field name='items'>
          {field => (
            <PickMultiConstituenta
              noBorder
              schema={sourceData.schema}
              items={filteredConstituents}
              rows={12}
              value={field.state.value ?? []}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      </div>
    </ModalForm>
  );
}
