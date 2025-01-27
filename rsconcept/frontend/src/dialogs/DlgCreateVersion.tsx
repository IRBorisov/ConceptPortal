'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { IVersionCreateDTO } from '@/backend/library/api';
import Checkbox from '@/components/ui/Checkbox';
import Modal from '@/components/ui/Modal';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { IVersionInfo } from '@/models/library';
import { nextVersion } from '@/models/libraryAPI';
import { ConstituentaID } from '@/models/rsform';
import { useDialogsStore } from '@/stores/dialogs';

export interface DlgCreateVersionProps {
  versions: IVersionInfo[];
  onCreate: (data: IVersionCreateDTO) => void;
  selected: ConstituentaID[];
  totalCount: number;
}

function DlgCreateVersion() {
  const { versions, selected, totalCount, onCreate } = useDialogsStore(state => state.props as DlgCreateVersionProps);
  const [version, setVersion] = useState(versions.length > 0 ? nextVersion(versions[0].version) : '1.0.0');
  const [description, setDescription] = useState('');
  const [onlySelected, setOnlySelected] = useState(false);

  const canSubmit = !versions.find(ver => ver.version === version);

  function handleSubmit() {
    onCreate({
      version: version,
      description: description,
      items: onlySelected ? selected : undefined
    });
  }

  return (
    <Modal
      header='Создание версии'
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
      <Checkbox
        id='dlg_only_selected'
        label={`Только выбранные конституенты [${selected.length} из ${totalCount}]`}
        value={onlySelected}
        setValue={value => setOnlySelected(value)}
      />
    </Modal>
  );
}

export default DlgCreateVersion;
