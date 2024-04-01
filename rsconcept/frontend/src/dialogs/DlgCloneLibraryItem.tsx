'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import Checkbox from '@/components/ui/Checkbox';
import Modal, { ModalProps } from '@/components/ui/Modal';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { useLibrary } from '@/context/LibraryContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { ILibraryItem } from '@/models/library';
import { cloneTitle } from '@/models/libraryAPI';
import { IRSFormCreateData } from '@/models/rsform';

interface DlgCloneLibraryItemProps extends Pick<ModalProps, 'hideWindow'> {
  base: ILibraryItem;
}

function DlgCloneLibraryItem({ hideWindow, base }: DlgCloneLibraryItemProps) {
  const router = useConceptNavigation();
  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);
  const [canonical, setCanonical] = useState(false);

  const { cloneItem } = useLibrary();

  const canSubmit = useMemo(() => title !== '' && alias !== '', [title, alias]);

  useEffect(() => {
    if (base) {
      setTitle(cloneTitle(base));
      setAlias(base.alias);
      setComment(base.comment);
      setCommon(base.is_common);
      setCanonical(false);
    }
  }, [base, base?.title, base?.alias, base?.comment, base?.is_common]);

  function handleSubmit() {
    const data: IRSFormCreateData = {
      item_type: base.item_type,
      title: title,
      alias: alias,
      comment: comment,
      is_common: common,
      is_canonical: canonical
    };
    cloneItem(base.id, data, newSchema => {
      toast.success(`Копия создана: ${newSchema.alias}`);
      router.push(urls.schema(newSchema.id));
    });
  }

  return (
    <Modal
      header='Создание копии концептуальной схемы'
      hideWindow={hideWindow}
      canSubmit={canSubmit}
      submitText='Создать'
      onSubmit={handleSubmit}
      className={clsx('px-6 py-2', 'cc-column')}
    >
      <TextInput
        id='dlg_full_name'
        label='Полное название'
        value={title}
        onChange={event => setTitle(event.target.value)}
      />
      <TextInput
        id='dlg_alias'
        label='Сокращение'
        value={alias}
        className='max-w-sm'
        onChange={event => setAlias(event.target.value)}
      />
      <TextArea
        id='dlg_comment'
        label='Комментарий'
        value={comment}
        onChange={event => setComment(event.target.value)}
      />
      <Checkbox id='dlg_is_common' label='Общедоступная схема' value={common} setValue={value => setCommon(value)} />
    </Modal>
  );
}

export default DlgCloneLibraryItem;
