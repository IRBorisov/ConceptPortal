'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { MiniButton } from '@/components/Control';
import { RelocateUpIcon } from '@/components/DomainIcons';
import { Loader } from '@/components/Loader';
import { ModalForm } from '@/components/Modal';
import { HelpTopic } from '@/features/help/models/helpTopic';
import { useLibrary } from '@/features/library/backend/useLibrary';
import SelectLibraryItem from '@/features/library/components/SelectLibraryItem';
import { ILibraryItem, LibraryItemID } from '@/features/library/models/library';
import { useRSForm } from '@/features/rsform/backend/useRSForm';
import PickMultiConstituenta from '@/features/rsform/components/PickMultiConstituenta';
import { useDialogsStore } from '@/stores/dialogs';

import { ICstRelocateDTO, IOperationPosition, schemaCstRelocate } from '../backend/api';
import { useRelocateConstituents } from '../backend/useRelocateConstituents';
import { useUpdatePositions } from '../backend/useUpdatePositions';
import { IOperation, IOperationSchema } from '../models/oss';
import { getRelocateCandidates } from '../models/ossAPI';

export interface DlgRelocateConstituentsProps {
  oss: IOperationSchema;
  initialTarget?: IOperation;
  positions: IOperationPosition[];
}

function DlgRelocateConstituents() {
  const { oss, initialTarget, positions } = useDialogsStore(state => state.props as DlgRelocateConstituentsProps);
  const { items: libraryItems } = useLibrary();
  const { updatePositions } = useUpdatePositions();
  const { relocateConstituents } = useRelocateConstituents();

  const {
    handleSubmit,
    control,
    setValue,
    resetField,
    formState: { isValid }
  } = useForm<ICstRelocateDTO>({
    resolver: zodResolver(schemaCstRelocate),
    defaultValues: {
      items: []
    },
    mode: 'onChange'
  });
  const destination = useWatch({ control, name: 'destination' });
  const destinationItem = destination ? libraryItems.find(item => item.id === destination) : undefined;

  const [directionUp, setDirectionUp] = useState(true);
  const [source, setSource] = useState<ILibraryItem | undefined>(
    libraryItems.find(item => item.id === initialTarget?.result)
  );

  console.log(isValid);

  const operation = oss.items.find(item => item.result === source?.id);
  const sourceSchemas = libraryItems.filter(item => oss.schemas.includes(item.id));
  const destinationSchemas = (() => {
    if (!operation) {
      return [];
    }
    const node = oss.graph.at(operation.id)!;
    const ids: LibraryItemID[] = directionUp
      ? node.inputs.map(id => oss.operationByID.get(id)!.result).filter(id => id !== null)
      : node.outputs.map(id => oss.operationByID.get(id)!.result).filter(id => id !== null);
    return ids.map(id => libraryItems.find(item => item.id === id)).filter(item => item !== undefined);
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
    resetField('destination');
  }

  function handleSelectSource(newValue: ILibraryItem | undefined) {
    setSource(newValue);
    resetField('destination');
    resetField('items');
  }

  function handleSelectDestination(newValue: ILibraryItem | undefined) {
    if (newValue) {
      setValue('destination', newValue.id);
    } else {
      resetField('destination');
    }
    resetField('items');
  }

  function onSubmit(data: ICstRelocateDTO) {
    const positionsUnchanged = positions.every(item => {
      const operation = oss.operationByID.get(item.id)!;
      return operation.position_x === item.position_x && operation.position_y === item.position_y;
    });
    if (positionsUnchanged) {
      relocateConstituents(data);
    } else {
      updatePositions(
        {
          isSilent: true,
          itemID: oss.id,
          positions: positions
        },
        () => relocateConstituents(data)
      );
    }
  }

  return (
    <ModalForm
      header='Перенос конституент'
      submitText='Переместить'
      canSubmit={isValid}
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

export default DlgRelocateConstituents;
