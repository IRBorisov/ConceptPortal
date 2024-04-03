'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import { IconDownload } from '@/components/Icons';
import InfoError from '@/components/info/InfoError';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';
import RequireAuth from '@/components/wrap/RequireAuth';
import { useLibrary } from '@/context/LibraryContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { LibraryItemType } from '@/models/library';
import { IRSFormCreateData } from '@/models/rsform';
import { EXTEOR_TRS_FILE, limits, patterns } from '@/utils/constants';

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
      router.push(urls.library);
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
    createItem(data, newSchema => {
      toast.success('Схема успешно создана');
      router.push(urls.schema(newSchema.id));
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
    <AnimateFade>
      <RequireAuth>
        <form className={clsx('cc-column', 'px-6 py-3')} onSubmit={handleSubmit}>
          <h1>Создание концептуальной схемы</h1>
          <Overlay position='top-[-2.4rem] right-[-1rem]'>
            <input
              id='schema_file'
              ref={inputRef}
              type='file'
              style={{ display: 'none' }}
              accept={EXTEOR_TRS_FILE}
              onChange={handleFileChange}
            />
            <MiniButton
              title='Загрузить из Экстеор'
              icon={<IconDownload size='1.25rem' className='icon-primary' />}
              onClick={() => inputRef.current?.click()}
            />
          </Overlay>
          {fileName ? <Label text={`Загружен файл: ${fileName}`} /> : null}

          <TextInput
            id='schema_title'
            required={!file}
            label='Полное название'
            placeholder={file && 'Загрузить из файла'}
            value={title}
            onChange={event => setTitle(event.target.value)}
          />
          <TextInput
            id='schema_alias'
            required={!file}
            label='Сокращение'
            placeholder={file && 'Загрузить из файла'}
            className='w-[14rem]'
            pattern={patterns.library_alias}
            title={`не более ${limits.library_alias_len} символов`}
            value={alias}
            onChange={event => setAlias(event.target.value)}
          />
          <TextArea
            id='schema_comment'
            label='Описание'
            placeholder={file && 'Загрузить из файла'}
            value={comment}
            onChange={event => setComment(event.target.value)}
          />
          <Checkbox
            id='schema_common'
            label='Общедоступная схема'
            value={common}
            setValue={value => setCommon(value ?? false)}
          />
          <div className='flex justify-around gap-6 py-3'>
            <SubmitButton text='Создать схему' loading={processing} className='min-w-[10rem]' />
            <Button text='Отмена' className='min-w-[10rem]' onClick={() => handleCancel()} />
          </div>
          {error ? <InfoError error={error} /> : null}
        </form>
      </RequireAuth>
    </AnimateFade>
  );
}

export default CreateRSFormPage;
