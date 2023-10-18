import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import BackendError from '../components/BackendError';
import Button from '../components/Common/Button';
import Checkbox from '../components/Common/Checkbox';
import Form from '../components/Common/Form';
import Label from '../components/Common/Label';
import MiniButton from '../components/Common/MiniButton';
import SubmitButton from '../components/Common/SubmitButton';
import TextArea from '../components/Common/TextArea';
import TextInput from '../components/Common/TextInput';
import { DownloadIcon } from '../components/Icons';
import RequireAuth from '../components/RequireAuth';
import { useLibrary } from '../context/LibraryContext';
import { useConceptNavigation } from '../context/NagivationContext';
import { LibraryItemType } from '../models/library';
import { IRSFormCreateData } from '../models/rsform';
import { EXTEOR_TRS_FILE } from '../utils/constants';

function CreateRSFormPage() {
  const location = useLocation();
  const { navigateTo, navigateHistory } = useConceptNavigation();
  const { createSchema, error, setError, processing } = useLibrary();

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);

  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setError(undefined);
  }, [title, alias, setError]);

  function handleCancel() {
    if (location.key !== 'default') {
      navigateHistory(-1);
    } else {
      navigateTo('/library');
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
      navigateTo(`/rsforms/${newSchema.id}`);
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
      setFile(event.target.files[0]);
    } else {
      setFileName('');
      setFile(undefined);
    }
  }

  return (
  <RequireAuth>
  <div className='flex justify-center w-full'>
  <Form title='Создание концептуальной схемы' 
    onSubmit={handleSubmit}
    dimensions='max-w-lg w-full mt-4'
  >
    <div className='relative w-full'>
    <div className='absolute top-[-2.4rem] right-[-1rem] flex'>
      <input
        type='file'
        ref={inputRef}
        style={{ display: 'none' }}
        accept={EXTEOR_TRS_FILE}
        onChange={handleFileChange}
      />
      <MiniButton
        tooltip='Загрузить из Экстеор'
        icon={<DownloadIcon size={5} color='text-primary'/>}
        onClick={() => inputRef.current?.click()}
      />
    </div>
    </div>
    <div className='flex flex-col gap-3'>
      { fileName && <Label text={`Загружен файл: ${fileName}`} />}
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
        setValue={value => setCommon(value ?? false)}
      />
      <div className='flex items-center justify-center gap-4 py-2'>
        <SubmitButton 
          text='Создать схему'
          loading={processing}
          dimensions='min-w-[10rem]'
        />
        <Button 
          text='Отмена'
          onClick={() => handleCancel()}
          dimensions='min-w-[10rem]'
        />
      </div>
      { error && <BackendError error={error} />}
    </div>
  </Form>
  </div>
  </RequireAuth>);
}

export default CreateRSFormPage;
