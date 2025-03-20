'use client';

import { useState } from 'react';

import { useUsers } from '@/features/users';
import { SelectUser, TableUsers } from '@/features/users/components';

import { MiniButton } from '@/components/control';
import { IconRemove } from '@/components/icons';
import { Label } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { useSetEditors } from '../../backend/use-set-editors';

export interface DlgEditEditorsProps {
  itemID: number;
  initialEditors: number[];
}

export function DlgEditEditors() {
  const { initialEditors: initial, itemID } = useDialogsStore(state => state.props as DlgEditEditorsProps);
  const { setEditors } = useSetEditors();

  const [selected, setSelected] = useState<number[]>(initial);
  const { users } = useUsers();

  function handleSubmit() {
    void setEditors({ itemID: itemID, editors: selected });
  }

  function onDeleteEditor(target: number) {
    setSelected(prev => prev.filter(id => id !== target));
  }

  function onAddEditor(target: number) {
    setSelected(prev => [...prev, target]);
  }

  return (
    <ModalForm
      header='Список редакторов'
      submitText='Сохранить список'
      className='flex flex-col w-140 px-6 gap-3 pb-6'
      onSubmit={handleSubmit}
    >
      <div className='self-center text-sm font-semibold'>
        <span>Всего редакторов [{selected.length}]</span>
        <MiniButton
          title='Очистить список'
          noHover
          className='py-0 align-middle'
          icon={<IconRemove size='1.5rem' className='icon-red' />}
          onClick={() => setSelected([])}
          disabled={selected.length === 0}
        />
      </div>

      <TableUsers items={users.filter(user => selected.includes(user.id))} onDelete={onDeleteEditor} />

      <div className='flex items-center gap-3'>
        <Label text='Добавить' />
        <SelectUser
          filter={id => !selected.includes(id)} //
          value={null}
          onChange={onAddEditor}
          className='w-100'
        />
      </div>
    </ModalForm>
  );
}
