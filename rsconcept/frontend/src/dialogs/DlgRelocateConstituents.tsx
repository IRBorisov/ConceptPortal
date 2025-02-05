'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { useLibrary } from '@/backend/library/useLibrary';
import { ICstRelocateDTO } from '@/backend/oss/api';
import { useRSForm } from '@/backend/rsform/useRSForm';
import { RelocateUpIcon } from '@/components/DomainIcons';
import PickMultiConstituenta from '@/components/select/PickMultiConstituenta';
import SelectLibraryItem from '@/components/select/SelectLibraryItem';
import Loader from '@/components/ui/Loader';
import MiniButton from '@/components/ui/MiniButton';
import Modal from '@/components/ui/Modal';
import { ILibraryItem, LibraryItemID } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { IOperation, IOperationSchema } from '@/models/oss';
import { getRelocateCandidates } from '@/models/ossAPI';
import { ConstituentaID } from '@/models/rsform';
import { useDialogsStore } from '@/stores/dialogs';

export interface DlgRelocateConstituentsProps {
  oss: IOperationSchema;
  initialTarget?: IOperation;
  onSubmit: (data: ICstRelocateDTO) => void;
}

function DlgRelocateConstituents() {
  const { oss, initialTarget, onSubmit } = useDialogsStore(state => state.props as DlgRelocateConstituentsProps);
  const { items: libraryItems } = useLibrary();

  const [directionUp, setDirectionUp] = useState(true);
  const [destination, setDestination] = useState<ILibraryItem | undefined>(undefined);
  const [selected, setSelected] = useState<ConstituentaID[]>([]);
  const [source, setSource] = useState<ILibraryItem | undefined>(
    libraryItems.find(item => item.id === initialTarget?.result)
  );
  const isValid = !!destination && selected.length > 0;

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
    if (!sourceData.schema || !destination || !operation) {
      return [];
    }
    const destinationOperation = oss.items.find(item => item.result === destination.id);
    return getRelocateCandidates(operation.id, destinationOperation!.id, sourceData.schema, oss);
  })();

  function toggleDirection() {
    setDirectionUp(prev => !prev);
    setDestination(undefined);
  }

  function handleSelectSource(newValue: ILibraryItem | undefined) {
    setSource(newValue);
    setDestination(undefined);
    setSelected([]);
  }

  function handleSelectDestination(newValue: ILibraryItem | undefined) {
    setDestination(newValue);
    setSelected([]);
  }

  function handleSubmit() {
    if (!destination) {
      return;
    }
    onSubmit({
      destination: destination.id,
      items: selected
    });
  }

  return (
    <Modal
      header='Перенос конституент'
      submitText='Переместить'
      canSubmit={isValid}
      onSubmit={handleSubmit}
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
            value={destination}
            onChange={handleSelectDestination}
          />
        </div>
        {sourceData.isLoading ? <Loader /> : null}
        {!sourceData.isLoading && sourceData.schema ? (
          <PickMultiConstituenta
            noBorder
            schema={sourceData.schema}
            items={filteredConstituents}
            rows={12}
            value={selected}
            onChange={setSelected}
          />
        ) : null}
      </div>
    </Modal>
  );
}

export default DlgRelocateConstituents;
