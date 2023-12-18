'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { BiDownload } from 'react-icons/bi';
import { toast } from 'react-toastify';

import Button from '@/components/Common/Button';
import Checkbox from '@/components/Common/Checkbox';
import Label from '@/components/Common/Label';
import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import SubmitButton from '@/components/Common/SubmitButton';
import TextArea from '@/components/Common/TextArea';
import TextInput from '@/components/Common/TextInput';
import InfoError from '@/components/InfoError';
import RequireAuth from '@/components/RequireAuth';
import { useLibrary } from '@/context/LibraryContext';
import { useConceptNavigation } from '@/context/NagivationContext';
import { LibraryItemType } from '@/models/library';
import { IRSFormCreateData } from '@/models/rsform';
import { classnames, EXTEOR_TRS_FILE, limits, patterns } from '@/utils/constants';

function CreateRSFormPage() {
  const router = useConceptNavigation();
  const { createItem, error, setError, processing } = useLibrary();

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
    if (router.canBack()) {
      router.back();
    } else {
      router.push('/library');
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
    createItem(data, (newSchema) => {
      toast.success('Схема успешно создана');
      router.push(`/rsforms/${newSchema.id}`);
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
  <form
    className={clsx(
      'px-6 py-3',
      classnames.flex_col
    )}
    onSubmit={handleSubmit}
  >
    <h1>Создание концептуальной схемы</h1>
    <Overlay position='top-[-2.4rem] right-[-1rem]'>
      <input ref={inputRef} type='file'
        style={{ display: 'none' }}
        accept={EXTEOR_TRS_FILE}
        onChange={handleFileChange}
      />
      <MiniButton
        title='Загрузить из Экстеор'
        icon={<BiDownload size='1.25rem' className='clr-text-primary'/>}
        onClick={() => inputRef.current?.click()}
      />
    </Overlay>
    {fileName ? <Label text={`Загружен файл: ${fileName}`} /> : null}

    <TextInput required={!file}
      label='Полное название'
      placeholder={file && 'Загрузить из файла'}
      value={title}
      onChange={event => setTitle(event.target.value)}
    />
    <TextInput required={!file}
      label='Сокращение'
      placeholder={file && 'Загрузить из файла'}
      className='w-[14rem]'
      pattern={patterns.alias}
      title={`не более ${limits.alias_len} символов`}
      value={alias}
      onChange={event => setAlias(event.target.value)}
    />
    <TextArea
      label='Комментарий'
      placeholder={file && 'Загрузить из файла'}
      value={comment}
      onChange={event => setComment(event.target.value)}
    />
    <Checkbox 
      label='Общедоступная схема'
      value={common}
      setValue={value => setCommon(value ?? false)}
    />
    <div className='flex justify-around gap-6 py-3'>
      <SubmitButton 
        text='Создать схему'
        loading={processing}
        className='min-w-[10rem]'
      />
      <Button
        text='Отмена'
        className='min-w-[10rem]'
        onClick={() => handleCancel()}
      />
    </div>
    {error ? <InfoError error={error} /> : null}
  </form>
  </RequireAuth>);
}

export default CreateRSFormPage;