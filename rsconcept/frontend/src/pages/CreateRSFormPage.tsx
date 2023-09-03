import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import BackendError from '../components/BackendError';
import Button from '../components/Common/Button';
import Checkbox from '../components/Common/Checkbox';
import FileInput from '../components/Common/FileInput';
import Form from '../components/Common/Form';
import SubmitButton from '../components/Common/SubmitButton';
import TextArea from '../components/Common/TextArea';
import TextInput from '../components/Common/TextInput';
import RequireAuth from '../components/RequireAuth';
import { useLibrary } from '../context/LibraryContext';
import { IRSFormCreateData, LibraryItemType } from '../utils/models';

function CreateRSFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { createSchema, error, setError, processing } = useLibrary();

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);
  const [file, setFile] = useState<File | undefined>()

  useEffect(() => {
    setError(undefined);
  }, [title, alias, setError]);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(undefined);
    }
  }

  function handleCancel() {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/library');
    }
  }
  
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (processing) {
      return;
    }
    const data: IRSFormCreateData = {
      item_type: LibraryItemType.RSFORM,
      title: title,
      alias: alias,
      comment: comment,
      is_common: common,
      is_canonical: false,
      file: file,
      fileName: file?.name
    };
    createSchema(data, (newSchema) => {
      toast.success('Схема успешно создана');
      navigate(`/rsforms/${newSchema.id}`);
    });
  }

  return (
    <RequireAuth>
    <Form title='Создание концептуальной схемы' 
      onSubmit={handleSubmit}
      widthClass='max-w-lg w-full mt-4'
    >
      <TextInput id='title' label='Полное название' type='text'
        required={!file}
        placeholder={file && 'Загрузить из файла'}
        value={title}
        onChange={event => setTitle(event.target.value)}
      />
      <TextInput id='alias' label='Сокращение' type='text'
        singleRow
        required={!file}
        value={alias}
        placeholder={file && 'Загрузить из файла'}
        onChange={event => setAlias(event.target.value)}
      />
      <TextArea id='comment' label='Комментарий'
        value={comment}
        placeholder={file && 'Загрузить из файла'}
        onChange={event => setComment(event.target.value)}
      />
      <Checkbox id='common' label='Общедоступная схема'
        value={common}
        onChange={event => setCommon(event.target.checked)}
      />
      <FileInput id='trs' label='Загрузить *.trs'
        acceptType='.trs'
        onChange={handleFile}
      />

      <div className='flex items-center justify-center gap-4 py-2 mt-4'>
        <SubmitButton 
          text='Создать схему'
          loading={processing}
          widthClass='min-w-[10rem]'
        />
        <Button 
          text='Отмена'
          onClick={() => handleCancel()}
          widthClass='min-w-[10rem]'
        />
      </div>
      { error && <BackendError error={error} />}
    </Form>
    </RequireAuth>
  );
}

export default CreateRSFormPage;
