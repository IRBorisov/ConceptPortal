'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { RelocateUpIcon } from '@/components/DomainIcons';
import PickMultiConstituenta from '@/components/select/PickMultiConstituenta';
import SelectLibraryItem from '@/components/select/SelectLibraryItem';
import MiniButton from '@/components/ui/MiniButton';
import Modal, { ModalProps } from '@/components/ui/Modal';
import DataLoader from '@/components/wrap/DataLoader';
import { useLibrary } from '@/context/LibraryContext';
import useRSFormDetails from '@/hooks/useRSFormDetails';
import { ILibraryItem, LibraryItemID } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { ICstRelocateData, IOperation, IOperationSchema } from '@/models/oss';
import { getRelocateCandidates } from '@/models/ossAPI';
import { ConstituentaID } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

interface DlgRelocateConstituentsProps extends Pick<ModalProps, 'hideWindow'> {
  oss: IOperationSchema;
  initialTarget?: IOperation;
  onSubmit: (data: ICstRelocateData) => void;
}

function DlgRelocateConstituents({ oss, hideWindow, initialTarget, onSubmit }: DlgRelocateConstituentsProps) {
  const library = useLibrary();

  const [directionUp, setDirectionUp] = useState(true);
  const [destination, setDestination] = useState<ILibraryItem | undefined>(undefined);
  const [selected, setSelected] = useState<ConstituentaID[]>([]);
  const [source, setSource] = useState<ILibraryItem | undefined>(
    library.items.find(item => item.id === initialTarget?.result)
  );
  const isValid = !!destination && selected.length > 0;

  const operation = oss.items.find(item => item.result === source?.id);
  const sourceSchemas = library.items.filter(item => oss.schemas.includes(item.id));
  const destinationSchemas = (() => {
    if (!operation) {
      return [];
    }
    const node = oss.graph.at(operation.id)!;
    const ids: LibraryItemID[] = directionUp
      ? node.inputs.map(id => oss.operationByID.get(id)!.result).filter(id => id !== null)
      : node.outputs.map(id => oss.operationByID.get(id)!.result).filter(id => id !== null);
    return ids.map(id => library.items.find(item => item.id === id)).filter(item => item !== undefined);
  })();

  const sourceData = useRSFormDetails({ target: source ? String(source.id) : undefined });
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
    const data: ICstRelocateData = {
      destination: destination.id,
      items: selected
    };
    onSubmit(data);
  }

  return (
    <Modal
      header='Перенос конституент'
      submitText='Переместить'
      hideWindow={hideWindow}
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
            onSelectValue={handleSelectSource}
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
            onSelectValue={handleSelectDestination}
          />
        </div>
        <DataLoader isLoading={sourceData.loading} error={sourceData.error}>
          {sourceData.schema ? (
            <PickMultiConstituenta
              noBorder
              schema={sourceData.schema}
              data={filteredConstituents}
              rows={12}
              prefixID={prefixes.dlg_cst_constituents_list}
              selected={selected}
              setSelected={setSelected}
            />
          ) : null}
        </DataLoader>
      </div>
    </Modal>
  );
}

export default DlgRelocateConstituents;
