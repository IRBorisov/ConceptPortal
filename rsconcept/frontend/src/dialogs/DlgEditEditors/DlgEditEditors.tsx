'use client';

import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';

import { IconRemove } from '@/components/Icons';
import SelectUser from '@/components/select/SelectUser';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Modal from '@/components/ui/Modal';
import { useUsers } from '@/context/UsersContext';
import { UserID } from '@/models/user';

import UsersTable from './UsersTable';

interface DlgEditEditorsProps {
  editors: UserID[];
  setEditors: (newValue: UserID[]) => void;
  hideWindow: () => void;
}

function DlgEditEditors({ hideWindow, editors, setEditors }: DlgEditEditorsProps) {
  const [selected, setSelected] = useState<UserID[]>(editors);
  const { users } = useUsers();
  const filtered = useMemo(() => users.filter(user => !selected.includes(user.id)), [users, selected]);

  function handleSubmit() {
    setEditors(selected);
  }

  const onDeleteEditor = useCallback((target: UserID) => setSelected(prev => prev.filter(id => id !== target)), []);

  const onAddEditor = useCallback((target: UserID) => setSelected(prev => [...prev, target]), []);

  const usersTable = useMemo(
    () => <UsersTable items={users.filter(user => selected.includes(user.id))} onDelete={onDeleteEditor} />,
    [users, selected, onDeleteEditor]
  );

  return (
    <Modal
      canSubmit
      header='Список редакторов'
      submitText='Сохранить список'
      hideWindow={hideWindow}
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

      {usersTable}

      <div className='flex items-center gap-3'>
        <Label text='Добавить' />
        <SelectUser items={filtered} value={undefined} onSelectValue={onAddEditor} className='w-[25rem]' />
      </div>
    </Modal>
  );
}

export default DlgEditEditors;
