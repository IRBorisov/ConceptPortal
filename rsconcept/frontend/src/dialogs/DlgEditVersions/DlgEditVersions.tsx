'use client';

import { useLayoutEffect, useMemo, useState } from 'react';
import { BiReset } from 'react-icons/bi';
import { FiSave } from 'react-icons/fi';

import MiniButton from '@/components/ui/MiniButton';
import Modal from '@/components/ui/Modal';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { useRSForm } from '@/context/RSFormContext';
import { IVersionData, IVersionInfo } from '@/models/library';

import VersionsTable from './VersionsTable';

interface DlgEditVersionsProps {
  hideWindow: () => void;
  versions: IVersionInfo[];
  onDelete: (versionID: number) => void;
  onUpdate: (versionID: number, data: IVersionData) => void;
}

function DlgEditVersions({ hideWindow, versions, onDelete, onUpdate }: DlgEditVersionsProps) {
  const { processing } = useRSForm();
  const [selected, setSelected] = useState<IVersionInfo | undefined>(undefined);

  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');

  const isValid = useMemo(() => {
    if (!selected) {
      return false;
    }
    return versions.every(ver => ver.id === selected.id || ver.version != version);
  }, [selected, version, versions]);

  const isModified = useMemo(() => {
    if (!selected) {
      return false;
    }
    return selected.version != version || selected.description != description;
  }, [version, description, selected]);

  function handleUpdate() {
    if (!isModified || !selected || processing || !isValid) {
      return;
    }
    const data: IVersionData = {
      version: version,
      description: description
    };
    onUpdate(selected.id, data);
  }

  function handleReset() {
    if (!selected) {
      return false;
    }
    setVersion(selected?.version ?? '');
    setDescription(selected?.description ?? '');
  }

  useLayoutEffect(() => {
    setVersion(selected?.version ?? '');
    setDescription(selected?.description ?? '');
  }, [selected]);

  return (
    <Modal
      readonly
      header='Редактирование версий'
      hideWindow={hideWindow}
      className='flex flex-col w-[40rem] px-6 gap-3 pb-6'
    >
      <VersionsTable
        processing={processing}
        items={versions}
        onDelete={onDelete}
        onSelect={versionID => setSelected(versions.find(ver => ver.id === versionID))}
        selected={selected?.id}
      />
      <div className='flex'>
        <TextInput
          id='dlg_version'
          dense
          label='Версия'
          className='w-[16rem] mr-3'
          value={version}
          onChange={event => setVersion(event.target.value)}
        />
        <MiniButton
          title='Сохранить изменения'
          disabled={!isModified || !isValid || processing}
          icon={<FiSave size='1.25rem' className='icon-primary' />}
          onClick={handleUpdate}
        />
        <MiniButton
          title='Сбросить несохраненные изменения'
          disabled={!isModified}
          onClick={handleReset}
          icon={<BiReset size='1.25rem' className='icon-primary' />}
        />
      </div>
      <TextArea
        id='dlg_description'
        spellCheck
        label='Описание'
        rows={3}
        value={description}
        onChange={event => setDescription(event.target.value)}
      />
    </Modal>
  );
}

export default DlgEditVersions;
