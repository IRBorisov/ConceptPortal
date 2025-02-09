'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { MiniButton } from '@/components/Control';
import { IconRemove } from '@/components/Icons';
import { Label } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { useUsers } from '@/features/users/backend/useUsers';
import SelectUser from '@/features/users/components/SelectUser';
import { UserID } from '@/features/users/models/user';
import { useDialogsStore } from '@/stores/dialogs';

import TableUsers from './TableUsers';

export interface DlgEditEditorsProps {
  editors: UserID[];
  onChangeEditors: (newValue: UserID[]) => void;
}

function DlgEditEditors() {
  const { editors, onChangeEditors } = useDialogsStore(state => state.props as DlgEditEditorsProps);
  const [selected, setSelected] = useState<UserID[]>(editors);
  const { users } = useUsers();

  function handleSubmit() {
    onChangeEditors(selected);
    return true;
  }

  function onDeleteEditor(target: UserID) {
    setSelected(prev => prev.filter(id => id !== target));
  }

  function onAddEditor(target: UserID) {
    setSelected(prev => [...prev, target]);
  }

  return (
    <ModalForm
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
          onChange={onAddEditor}
          className='w-[25rem]'
        />
      </div>
    </ModalForm>
  );
}

export default DlgEditEditors;
