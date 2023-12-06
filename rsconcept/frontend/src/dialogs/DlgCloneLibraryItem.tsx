import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import Checkbox from '../components/Common/Checkbox';
import Modal, { ModalProps } from '../components/Common/Modal';
import TextArea from '../components/Common/TextArea';
import TextInput from '../components/Common/TextInput';
import { useLibrary } from '../context/LibraryContext';
import { useConceptNavigation } from '../context/NagivationContext';
import { ILibraryItem } from '../models/library';
import { IRSFormCreateData } from '../models/rsform';
import { cloneTitle } from '../utils/misc';

interface DlgCloneLibraryItemProps
extends Pick<ModalProps, 'hideWindow'> {
  base: ILibraryItem
}

function DlgCloneLibraryItem({ hideWindow, base }: DlgCloneLibraryItemProps) {
  const { navigateTo } = useConceptNavigation();
  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);
  const [canonical, setCanonical] = useState(false);

  const { cloneItem } = useLibrary();

  const canSubmit = useMemo(() => (title !== '' && alias !== ''), [title, alias]);

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
      navigateTo(`/rsforms/${newSchema.id}`);
    });
  }

  return (
  <Modal
    title='Создание копии концептуальной схемы'
    hideWindow={hideWindow}
    canSubmit={canSubmit}
    submitText='Создать'
    onSubmit={handleSubmit}
    className='flex flex-col gap-3 px-6 py-2'
  >
    <TextInput
      label='Полное название'
      value={title}
      onChange={event => setTitle(event.target.value)}
    />
    <TextInput
      label='Сокращение'
      value={alias}
      dimensions='max-w-sm'
      onChange={event => setAlias(event.target.value)}
    />
    <TextArea
      label='Комментарий'
      value={comment}
      onChange={event => setComment(event.target.value)}
    />
    <Checkbox
      label='Общедоступная схема'
      value={common}
      setValue={value => setCommon(value)}
    />
  </Modal>);
}

export default DlgCloneLibraryItem;
