'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import { VisibilityIcon } from '@/components/DomainIcons';
import { IconDownload } from '@/components/Icons';
import InfoError from '@/components/info/InfoError';
import SelectAccessPolicy from '@/components/select/SelectAccessPolicy';
import SelectLocationHead from '@/components/select/SelectLocationHead';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { AccessPolicy, LibraryItemType, LocationHead } from '@/models/library';
import { ILibraryCreateData } from '@/models/library';
import { combineLocation, validateLocation } from '@/models/libraryAPI';
import { EXTEOR_TRS_FILE, limits, patterns } from '@/utils/constants';

function FormCreateItem() {
  const router = useConceptNavigation();
  const { user } = useAuth();
  const { createItem, error, setError, processing } = useLibrary();

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [visible, setVisible] = useState(true);
  const [policy, setPolicy] = useState(AccessPolicy.PUBLIC);

  const [head, setHead] = useState(LocationHead.USER);
  const [body, setBody] = useState('');

  const location = useMemo(() => combineLocation(head, body), [head, body]);
  const isValid = useMemo(() => validateLocation(location), [location]);

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
    const data: ILibraryCreateData = {
      item_type: LibraryItemType.RSFORM,
      title: title,
      alias: alias,
      comment: comment,
      read_only: false,
      visible: visible,
      access_policy: policy,
      location: location,
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
    <>
      <Overlay position='top-[0.5rem] right-[0.5rem]'>
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

      <form className={clsx('cc-column', 'min-w-[30rem]', 'px-6 py-3')} onSubmit={handleSubmit}>
        <h1>Создание концептуальной схемы</h1>

        {fileName ? <Label text={`Загружен файл: ${fileName}`} /> : null}

        <TextInput
          id='schema_title'
          required={!file}
          label='Полное название'
          placeholder={file && 'Загрузить из файла'}
          value={title}
          onChange={event => setTitle(event.target.value)}
        />

        <div className='flex justify-between gap-3'>
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
          <div className='flex flex-col gap-2'>
            <Label text='Доступ' className='self-center select-none' />
            <div className='ml-auto cc-icons'>
              <SelectAccessPolicy value={policy} onChange={newPolicy => setPolicy(newPolicy)} />

              <MiniButton
                className='disabled:cursor-auto'
                title={visible ? 'Библиотека: отображать' : 'Библиотека: скрывать'}
                icon={<VisibilityIcon value={visible} />}
                onClick={() => setVisible(prev => !prev)}
              />
            </div>
          </div>
        </div>

        <TextArea
          id='schema_comment'
          label='Описание'
          placeholder={file && 'Загрузить из файла'}
          value={comment}
          onChange={event => setComment(event.target.value)}
        />

        <div className='flex justify-between gap-3'>
          <div className='flex flex-col gap-2 w-[7rem] h-min'>
            <Label text='Корень' />
            <SelectLocationHead
              value={head}
              onChange={setHead}
              excluded={!user?.is_staff ? [LocationHead.LIBRARY] : []}
            />
          </div>
          <TextArea
            id='dlg_cst_body'
            label='Путь'
            className='w-[18rem]'
            rows={4}
            value={body}
            onChange={event => setBody(event.target.value)}
          />
        </div>

        <div className='flex justify-around gap-6 py-3'>
          <SubmitButton text='Создать схему' loading={processing} className='min-w-[10rem]' disabled={!isValid} />
          <Button text='Отмена' className='min-w-[10rem]' onClick={() => handleCancel()} />
        </div>
        {error ? <InfoError error={error} /> : null}
      </form>
    </>
  );
}

export default FormCreateItem;
