'use client';

import { useEffect, useState } from 'react';

import { IconReset, IconSave } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton';
import Modal from '@/components/ui/Modal';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { IVersionData, IVersionInfo, VersionID } from '@/models/library';
import { useDialogsStore } from '@/stores/dialogs';

import TableVersions from './TableVersions';

export interface DlgEditVersionsProps {
  versions: IVersionInfo[];
  onDelete: (versionID: VersionID) => void;
  onUpdate: (versionID: VersionID, data: IVersionData) => void;
}

function DlgEditVersions() {
  const { versions, onDelete, onUpdate } = useDialogsStore(state => state.props as DlgEditVersionsProps);
  const [selected, setSelected] = useState<IVersionInfo | undefined>(undefined);
  const processing = false; // TODO: fix processing hook and versions update

  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');

  const isValid = selected && versions.every(ver => ver.id === selected.id || ver.version != version);
  const isModified = selected && (selected.version != version || selected.description != description);

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

  useEffect(() => {
    setVersion(selected?.version ?? '');
    setDescription(selected?.description ?? '');
  }, [selected]);

  return (
    <Modal readonly header='Редактирование версий' className='flex flex-col w-[40rem] px-6 gap-3 pb-6'>
      <TableVersions
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
        <div className='cc-icons'>
          <MiniButton
            title='Сохранить изменения'
            disabled={!isModified || !isValid || processing}
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            onClick={handleUpdate}
          />
          <MiniButton
            title='Сбросить несохраненные изменения'
            disabled={!isModified}
            onClick={handleReset}
            icon={<IconReset size='1.25rem' className='icon-primary' />}
          />
        </div>
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
