'use client';

import clsx from 'clsx';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import PickMultiConstituenta from '@/components/select/PickMultiConstituenta';
import SelectLibraryItem from '@/components/select/SelectLibraryItem';
import Modal, { ModalProps } from '@/components/ui/Modal';
import DataLoader from '@/components/wrap/DataLoader';
import { useLibrary } from '@/context/LibraryContext';
import useRSFormDetails from '@/hooks/useRSFormDetails';
import { ILibraryItem, LibraryItemID } from '@/models/library';
import { ICstRelocateData, IOperation, IOperationSchema } from '@/models/oss';
import { getRelocateCandidates } from '@/models/ossAPI';
import { ConstituentaID } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

interface DlgRelocateConstituentsProps extends Pick<ModalProps, 'hideWindow'> {
  oss: IOperationSchema;
  target: IOperation;
  onSubmit: (data: ICstRelocateData) => void;
}

function DlgRelocateConstituents({ oss, hideWindow, target, onSubmit }: DlgRelocateConstituentsProps) {
  const library = useLibrary();
  const schemas = useMemo(() => {
    const node = oss.graph.at(target.id)!;
    const ids: LibraryItemID[] = [
      ...node.inputs.map(id => oss.operationByID.get(id)!.result).filter(id => id !== null),
      ...node.outputs.map(id => oss.operationByID.get(id)!.result).filter(id => id !== null)
    ];
    return ids.map(id => library.items.find(item => item.id === id)).filter(item => item !== undefined);
  }, [oss, library.items]);

  const [destination, setDestination] = useState<ILibraryItem | undefined>(undefined);
  const [selected, setSelected] = useState<ConstituentaID[]>([]);

  const source = useRSFormDetails({ target: String(target.result!) });
  const filtered = useMemo(() => {
    if (!source.schema || !destination) {
      return [];
    }
    const destinationOperation = oss.items.find(item => item.result === destination.id);
    return getRelocateCandidates(target.id, destinationOperation!.id, source.schema, oss);
  }, [destination, source.schema?.items]);

  const isValid = useMemo(() => !!destination && selected.length > 0, [destination, selected]);

  useLayoutEffect(() => {
    setSelected([]);
  }, [destination]);

  const handleSelectDestination = useCallback((newValue: ILibraryItem | undefined) => {
    setDestination(newValue);
  }, []);

  const handleSubmit = useCallback(() => {
    const data: ICstRelocateData = {
      destination: target.result ?? 0,
      items: []
    };
    onSubmit(data);
  }, [target, onSubmit]);

  return (
    <Modal
      header='Перемещение конституент'
      submitText='Переместить'
      hideWindow={hideWindow}
      canSubmit={isValid}
      onSubmit={handleSubmit}
      className={clsx('w-[40rem] h-[33rem]', 'py-3 px-6')}
    >
      <DataLoader id='dlg-relocate-constituents' className='cc-column' isLoading={source.loading} error={source.error}>
        <SelectLibraryItem
          placeholder='Выберите целевую схему'
          items={schemas}
          value={destination}
          onSelectValue={handleSelectDestination}
        />
        {source.schema ? (
          <PickMultiConstituenta
            schema={source.schema}
            data={filtered}
            rows={12}
            prefixID={prefixes.dlg_cst_constituents_list}
            selected={selected}
            setSelected={setSelected}
          />
        ) : null}
      </DataLoader>
    </Modal>
  );
}

export default DlgRelocateConstituents;
