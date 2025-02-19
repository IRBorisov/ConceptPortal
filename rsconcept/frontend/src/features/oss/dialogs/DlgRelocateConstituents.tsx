'use client';

import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { ILibraryItem, SelectLibraryItem, useLibrary } from '@/features/library';
import { PickMultiConstituenta, useRSForm } from '@/features/rsform';

import { MiniButton } from '@/components/Control';
import { RelocateUpIcon } from '@/components/DomainIcons';
import { Loader } from '@/components/Loader';
import { ModalForm } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';

import { ICstRelocateDTO, IOperationPosition, schemaCstRelocate } from '../backend/types';
import { useRelocateConstituents } from '../backend/useRelocateConstituents';
import { useUpdatePositions } from '../backend/useUpdatePositions';
import { IOperation, IOperationSchema } from '../models/oss';
import { getRelocateCandidates } from '../models/ossAPI';

export interface DlgRelocateConstituentsProps {
  oss: IOperationSchema;
  initialTarget?: IOperation;
  positions: IOperationPosition[];
}

export function DlgRelocateConstituents() {
  const { oss, initialTarget, positions } = useDialogsStore(state => state.props as DlgRelocateConstituentsProps);
  const { items: libraryItems } = useLibrary();
  const { updatePositions } = useUpdatePositions();
  const { relocateConstituents } = useRelocateConstituents();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isValid }
  } = useForm<ICstRelocateDTO>({
    resolver: zodResolver(schemaCstRelocate),
    defaultValues: {
      items: []
    },
    mode: 'onChange'
  });
  const destination = useWatch({ control, name: 'destination' });
  const destinationItem = destination ? libraryItems.find(item => item.id === destination) ?? null : null;

  const [directionUp, setDirectionUp] = useState(true);
  const [source, setSource] = useState<ILibraryItem | null>(
    libraryItems.find(item => item.id === initialTarget?.result) ?? null
  );

  const operation = oss.items.find(item => item.result === source?.id);
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
    const destinationOperation = oss.items.find(item => item.result === destination);
    return getRelocateCandidates(operation.id, destinationOperation!.id, sourceData.schema, oss);
  })();

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

  function onSubmit(data: ICstRelocateDTO) {
    const positionsUnchanged = positions.every(item => {
      const operation = oss.operationByID.get(item.id)!;
      return operation.position_x === item.position_x && operation.position_y === item.position_y;
    });
    if (positionsUnchanged) {
      return relocateConstituents(data);
    } else {
      return updatePositions({
        isSilent: true,
        itemID: oss.id,
        positions: positions
      }).then(() => relocateConstituents(data));
    }
  }

  return (
    <ModalForm
      header='Перенос конституент'
      submitText='Переместить'
      canSubmit={isValid && destinationItem !== undefined}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className={clsx('w-[40rem] h-[33rem]', 'py-3 px-6')}
      helpTopic={HelpTopic.UI_RELOCATE_CST}
    >
      <div className='flex flex-col border'>
        <div className='flex gap-1 items-center clr-input border-b rounded-t-md'>
          <SelectLibraryItem
            noBorder
            className='w-1/2'
            placeholder='Выберите исходную схему'
            items={sourceSchemas}
            value={source}
            onChange={handleSelectSource}
          />
          <MiniButton
            title='Направление перемещения'
            icon={<RelocateUpIcon value={directionUp} />}
            onClick={toggleDirection}
          />
          <SelectLibraryItem
            noBorder
            className='w-1/2'
            placeholder='Выберите целевую схему'
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
