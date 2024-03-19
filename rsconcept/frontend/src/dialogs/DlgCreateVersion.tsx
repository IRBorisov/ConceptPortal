'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';

import Modal, { ModalProps } from '@/components/ui/Modal';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { IVersionData, IVersionInfo } from '@/models/library';
import { nextVersion } from '@/models/libraryAPI';

interface DlgCreateVersionProps extends Pick<ModalProps, 'hideWindow'> {
  versions: IVersionInfo[];
  onCreate: (data: IVersionData) => void;
}

function DlgCreateVersion({ hideWindow, versions, onCreate }: DlgCreateVersionProps) {
  const [version, setVersion] = useState(versions.length > 0 ? nextVersion(versions[0].version) : '1.0.0');
  const [description, setDescription] = useState('');

  const canSubmit = useMemo(() => {
    return !versions.find(ver => ver.version === version);
  }, [versions, version]);

  function handleSubmit() {
    const data: IVersionData = {
      version: version,
      description: description
    };
    onCreate(data);
  }

  return (
    <Modal
      header='Создание версии'
      hideWindow={hideWindow}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      submitText='Создать'
      className={clsx('cc-column', 'w-[30rem]', 'py-2 px-6')}
    >
      <TextInput
        id='dlg_version'
        dense
        label='Версия'
        className='w-[16rem]'
        value={version}
        onChange={event => setVersion(event.target.value)}
      />
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

export default DlgCreateVersion;
