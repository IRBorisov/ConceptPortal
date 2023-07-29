import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import Checkbox from '../../components/Common/Checkbox';
import Modal from '../../components/Common/Modal';
import TextArea from '../../components/Common/TextArea';
import TextInput from '../../components/Common/TextInput';
import { useRSForm } from '../../context/RSFormContext';
import { IRSFormCreateData } from '../../utils/models';
import { getCloneTitle } from '../../utils/staticUI';

interface DlgCloneRSFormProps {
  hideWindow: () => void
}

function DlgCloneRSForm({ hideWindow }: DlgCloneRSFormProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);

  const { schema, clone } = useRSForm();

  useEffect(() => {
    if (schema) {
      setTitle(getCloneTitle(schema))
      setAlias(schema.alias)
      setComment(schema.comment)
      setCommon(schema.is_common)
    }
  }, [schema, schema?.title, schema?.alias, schema?.comment, schema?.is_common]);

  const handleSubmit = () => {
    const data: IRSFormCreateData = {
      title: title,
      alias: alias,
      comment: comment,
      is_common: common
    };
    clone(data, newSchema => {
      toast.success(`Схема создана: ${newSchema.alias}`);
      navigate(`/rsforms/${newSchema.id}`);
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
      <TextInput id='title' label='Полное название' type='text'
        required
        value={title}
        onChange={event => { setTitle(event.target.value); }}
      />
      <TextInput id='alias' label='Сокращение' type='text'
        required
        value={alias}
        widthClass='max-w-sm'
        onChange={event => { setAlias(event.target.value); }}
      />
      <TextArea id='comment' label='Комментарий'
        value={comment}
        onChange={event => { setComment(event.target.value); }}
      />
      <Checkbox id='common' label='Общедоступная схема'
        value={common}
        onChange={event => { setCommon(event.target.checked); }}
      />
    </Modal>
  );
}

export default DlgCloneRSForm;
