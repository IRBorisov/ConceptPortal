import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import BackendError from '../components/BackendError';
import Checkbox from '../components/Common/Checkbox';
import FileInput from '../components/Common/FileInput';
import Form from '../components/Common/Form';
import SubmitButton from '../components/Common/SubmitButton';
import TextArea from '../components/Common/TextArea';
import TextInput from '../components/Common/TextInput';
import RequireAuth from '../components/RequireAuth';
import useNewRSForm from '../hooks/useNewRSForm';
import { IRSFormCreateData, IRSFormMeta } from '../utils/models';

function RSFormCreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);
  const [file, setFile] = useState<File | undefined>()

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(undefined)
    }
  }

  const onSuccess = (newSchema: IRSFormMeta) => {
    toast.success('Схема успешно создана');
    navigate(`/rsforms/${newSchema.id}`);
  }
  const { createSchema, error, setError, loading } = useNewRSForm()

  useEffect(() => {
    setError(undefined)
  }, [title, alias, setError]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) {
      return;
    }
    const data: IRSFormCreateData = {
      title: title,
      alias: alias,
      comment: comment,
      is_common: common,
      file: file,
      fileName: file?.name
    };
    void createSchema(data, onSuccess);
  };

  return (
    <RequireAuth>
      <Form title='Создание концептуальной схемы' onSubmit={handleSubmit} widthClass='max-w-lg mt-4'>
        <TextInput id='title' label='Полное название' type='text'
          required={!file}
          placeholder={file && 'Загрузить из файла'}
          value={title}
          onChange={event => { setTitle(event.target.value); }}
        />
        <TextInput id='alias' label='Сокращение' type='text'
          required={!file}
          value={alias}
          placeholder={file && 'Загрузить из файла'}
          widthClass='max-w-sm'
          onChange={event => { setAlias(event.target.value); }}
        />
        <TextArea id='comment' label='Комментарий'
          value={comment}
          placeholder={file && 'Загрузить из файла'}
          onChange={event => { setComment(event.target.value); }}
        />
        <Checkbox id='common' label='Общедоступная схема'
          value={common}
          onChange={event => { setCommon(event.target.checked); }}
        />
        <FileInput id='trs' label='Загрузить *.trs'
          acceptType='.trs'
          onChange={handleFile}
        />

        <div className='flex items-center justify-center py-2 mt-4'>
          <SubmitButton text='Создать схему' loading={loading} />
        </div>
        { error && <BackendError error={error} />}
      </Form>
    </RequireAuth>
  );
}

export default RSFormCreatePage;
