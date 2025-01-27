'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { useUsers } from '@/backend/users/useUsers';
import { IconRemove } from '@/components/Icons';
import SelectUser from '@/components/select/SelectUser';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Modal from '@/components/ui/Modal';
import { UserID } from '@/models/user';
import { useDialogsStore } from '@/stores/dialogs';

import TableUsers from './TableUsers';

export interface DlgEditEditorsProps {
  editors: UserID[];
  setEditors: (newValue: UserID[]) => void;
}

function DlgEditEditors() {
  const { editors, setEditors } = useDialogsStore(state => state.props as DlgEditEditorsProps);
  const [selected, setSelected] = useState<UserID[]>(editors);
  const { users } = useUsers();

  function handleSubmit() {
    setEditors(selected);
  }

  function onDeleteEditor(target: UserID) {
    setSelected(prev => prev.filter(id => id !== target));
  }

  function onAddEditor(target: UserID) {
    setSelected(prev => [...prev, target]);
  }

  return (
    <Modal
      canSubmit
      header='Список редакторов'
      submitText='Сохранить список'
      className='flex flex-col w-[35rem] px-6 gap-3 pb-6'
      onSubmit={handleSubmit}
    >
      <div className={clsx('flex self-center items-center', 'text-sm font-semibold')}>
        <span>Всего редакторов [{selected.length}]</span>
        <MiniButton
          noHover
          title='Очистить список'
          className='py-0'
          icon={<IconRemove size='1.5rem' className='icon-red' />}
          disabled={selected.length === 0}
          onClick={() => setSelected([])}
        />
      </div>

      <TableUsers items={users.filter(user => selected.includes(user.id))} onDelete={onDeleteEditor} />

      <div className='flex items-center gap-3'>
        <Label text='Добавить' />
        <SelectUser
          filter={id => !selected.includes(id)}
          value={undefined}
          onSelectValue={onAddEditor}
          className='w-[25rem]'
        />
      </div>
    </Modal>
  );
}

export default DlgEditEditors;
