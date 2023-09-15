import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Checkbox from '../../components/Common/Checkbox';
import Modal, { ModalProps } from '../../components/Common/Modal';
import TextArea from '../../components/Common/TextArea';
import TextInput from '../../components/Common/TextInput';
import { useLibrary } from '../../context/LibraryContext';
import { useConceptNavigation } from '../../context/NagivationContext';
import { useRSForm } from '../../context/RSFormContext';
import { IRSFormCreateData } from '../../models/rsform';
import { getCloneTitle } from '../../utils/staticUI';

interface DlgCloneRSFormProps
extends Pick<ModalProps, 'hideWindow'> {}

function DlgCloneRSForm({ hideWindow }: DlgCloneRSFormProps) {
  const { navigateTo } = useConceptNavigation();
  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);
  const [canonical, setCanonical] = useState(false);

  const { cloneSchema } = useLibrary();
  const { schema } = useRSForm();

  useEffect(() => {
    if (schema) {
      setTitle(getCloneTitle(schema));
      setAlias(schema.alias);
      setComment(schema.comment);
      setCommon(schema.is_common);
      setCanonical(false);
    }
  }, [schema, schema?.title, schema?.alias, schema?.comment, schema?.is_common]);

  const handleSubmit = () => {
    if (!schema) {
      return;
    }
    const data: IRSFormCreateData = {
      item_type: schema.item_type,
      title: title,
      alias: alias,
      comment: comment,
      is_common: common,
      is_canonical: canonical
    };
    cloneSchema(schema.id, data, newSchema => {
      toast.success(`Схема создана: ${newSchema.alias}`);
      navigateTo(`/rsforms/${newSchema.id}`);
    });
  };

  return (
    <Modal
      title='Создание копии концептуальной схемы'
      hideWindow={hideWindow}
      canSubmit={true}
      submitText='Создать'
      onSubmit={handleSubmit}
    >
    <div className='flex flex-col gap-3'>
      <TextInput id='title' label='Полное название' type='text'
        required
        value={title}
        onChange={event => setTitle(event.target.value)}
      />
      <TextInput id='alias' label='Сокращение' type='text'
        required
        value={alias}
        dimensions='max-w-sm'
        onChange={event => setAlias(event.target.value)}
      />
      <TextArea id='comment' label='Комментарий'
        value={comment}
        onChange={event => setComment(event.target.value)}
      />
      <Checkbox id='common' label='Общедоступная схема'
        value={common}
        setValue={value => setCommon(value)}
      />
    </div>
    </Modal>
  );
}

export default DlgCloneRSForm;
