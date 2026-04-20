'use client';

import { type SubmitEvent, useState } from 'react';

import { useUsers } from '@/features/users';
import { SelectUser } from '@/features/users/components/select-user';
import { TableUsers } from '@/features/users/components/table-users';

import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { type RO } from '@/utils/meta';

import { useSetEditors } from '../../backend/use-set-editors';

export interface DlgEditEditorsProps {
  itemID: number;
  initialEditors: RO<number[]>;
}

export function DlgEditEditors() {
  const { initialEditors: initial, itemID } = useDialogsStore(state => state.props as DlgEditEditorsProps);
  const { setEditors } = useSetEditors();

  const [selected, setSelected] = useState<number[]>([...initial]);
  const { users } = useUsers();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
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
      header={`Список редакторов — ${selected.length}`}
      submitText='Сохранить список'
      className='flex flex-col w-140 px-6 pb-3'
      onSubmit={handleSubmit}
    >
      <TableUsers
        items={users.filter(user => selected.includes(user.id))}
        onDelete={onDeleteEditor}
        onReset={() => setSelected([])}
        className='rounded-b-none border-b-0'
      />
      <SelectUser
        placeholder='Добавить редактора'
        filter={id => !selected.includes(id)} //
        value={null}
        noAnonymous
        className='text-sm rounded-t-none'
        onChange={user => user && onAddEditor(user)}
      />
    </ModalForm>
  );
}
