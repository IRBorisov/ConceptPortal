'use client';

import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';
import { type ILibraryItem } from '@/features/library';
import { useLibrary } from '@/features/library/backend/use-library';
import { SelectLibraryItem } from '@/features/library/components/select-library-item';
import { useRSForm } from '@/features/rsform/backend/use-rsform';
import { PickMultiConstituenta } from '@/features/rsform/components/pick-multi-constituenta';

import { MiniButton } from '@/components/control';
import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type IOssLayout, type IRelocateConstituentsDTO, schemaRelocateConstituents } from '../backend/types';
import { useRelocateConstituents } from '../backend/use-relocate-constituents';
import { useUpdateLayout } from '../backend/use-update-layout';
import { IconRelocationUp } from '../components/icon-relocation-up';
import { type IOperation, type IOperationSchema } from '../models/oss';
import { getRelocateCandidates } from '../models/oss-api';

export interface DlgRelocateConstituentsProps {
  oss: IOperationSchema;
  initialTarget?: IOperation;
  layout?: IOssLayout;
}

export function DlgRelocateConstituents() {
  const { oss, initialTarget, layout } = useDialogsStore(state => state.props as DlgRelocateConstituentsProps);
  const { items: libraryItems } = useLibrary();
  const { updateLayout: updatePositions } = useUpdateLayout();
  const { relocateConstituents } = useRelocateConstituents();

  const { handleSubmit, control, setValue } = useForm<IRelocateConstituentsDTO>({
    resolver: zodResolver(schemaRelocateConstituents),
    defaultValues: {
      items: []
    },
    mode: 'onChange'
  });
  const selected = useWatch({ control, name: 'items' });
  const destination = useWatch({ control, name: 'destination' });
  const destinationItem = destination ? libraryItems.find(item => item.id === destination) ?? null : null;

  const [directionUp, setDirectionUp] = useState(true);
  const [source, setSource] = useState<ILibraryItem | null>(
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

  function toggleDirection() {
    setDirectionUp(prev => !prev);
    setValue('destination', null);
  }

  function handleSelectSource(newValue: ILibraryItem | null) {
    setSource(newValue);
    setValue('destination', null);
    setValue('items', []);
  }

  function handleSelectDestination(newValue: ILibraryItem | null) {
    if (newValue) {
      setValue('destination', newValue.id);
    } else {
      setValue('destination', null);
    }
    setValue('items', []);
  }

  function onSubmit(data: IRelocateConstituentsDTO) {
    data.items = moveTarget;
    if (!layout || JSON.stringify(layout) === JSON.stringify(oss.layout)) {
      return relocateConstituents(data);
    } else {
      return updatePositions({
        isSilent: true,
        itemID: oss.id,
        data: layout
      }).then(() => relocateConstituents(data));
    }
  }

  return (
    <ModalForm
      header='Перенос конституент'
      submitText='Переместить'
      canSubmit={isValid && destinationItem !== undefined}
      submitInvalidTooltip='Необходимо выбрать хотя бы одну собственную конституенту'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
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
        {sourceData.isLoading ? <Loader /> : null}
        {!sourceData.isLoading && sourceData.schema ? (
          <Controller
            name='items'
            control={control}
            render={({ field }) => (
              <PickMultiConstituenta
                noBorder
                schema={sourceData.schema!}
                items={filteredConstituents}
                rows={12}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        ) : null}
      </div>
    </ModalForm>
  );
}
