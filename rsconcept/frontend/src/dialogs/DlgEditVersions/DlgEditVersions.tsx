'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { useIsProcessingLibrary } from '@/backend/library/useIsProcessingLibrary';
import { useVersionDelete } from '@/backend/library/useVersionDelete';
import { useVersionUpdate } from '@/backend/library/useVersionUpdate';
import { IconReset, IconSave } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton';
import Modal from '@/components/ui/Modal';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { ILibraryItemVersioned, IVersionData, IVersionInfo, VersionID } from '@/models/library';
import { useDialogsStore } from '@/stores/dialogs';
import { information } from '@/utils/labels';

import TableVersions from './TableVersions';

export interface DlgEditVersionsProps {
  item: ILibraryItemVersioned;
}

function DlgEditVersions() {
  const { item } = useDialogsStore(state => state.props as DlgEditVersionsProps);
  const router = useConceptNavigation();
  const processing = useIsProcessingLibrary();
  const { versionDelete } = useVersionDelete();
  const { versionUpdate } = useVersionUpdate();

  const [selected, setSelected] = useState<IVersionInfo | undefined>(undefined);
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');

  const isValid = selected && item.versions.every(ver => ver.id === selected.id || ver.version != version);
  const isModified = selected && (selected.version != version || selected.description != description);

  function handleDeleteVersion(versionID: VersionID) {
    versionDelete({ itemID: item.id, versionID: versionID }, () => {
      toast.success(information.versionDestroyed);
      if (versionID === versionID) {
        router.push(urls.schema(item.id));
      }
    });
  }

  function handleUpdate() {
    if (!isModified || !selected || processing || !isValid) {
      return;
    }
    const data: IVersionData = {
      version: version,
      description: description
    };
    versionUpdate(
      {
        itemID: item.id, //
        versionID: selected.id,
        data: data
      },
      () => toast.success(information.changesSaved)
    );
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
        items={item.versions}
        onDelete={handleDeleteVersion}
        onSelect={versionID => setSelected(item.versions.find(ver => ver.id === versionID))}
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
