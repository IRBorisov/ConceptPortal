'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { useAuth } from '@/backend/auth/useAuth';
import { ILibraryCreateDTO } from '@/backend/library/api';
import { useCreateItem } from '@/backend/library/useCreateItem';
import { VisibilityIcon } from '@/components/DomainIcons';
import { IconDownload } from '@/components/Icons';
import InfoError from '@/components/info/InfoError';
import SelectAccessPolicy from '@/components/select/SelectAccessPolicy';
import SelectItemType from '@/components/select/SelectItemType';
import SelectLocationContext from '@/components/select/SelectLocationContext';
import SelectLocationHead from '@/components/select/SelectLocationHead';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { AccessPolicy, LibraryItemType, LocationHead } from '@/models/library';
import { combineLocation, validateLocation } from '@/models/libraryAPI';
import { useLibrarySearchStore } from '@/stores/librarySearch';
import { EXTEOR_TRS_FILE } from '@/utils/constants';

function FormCreateItem() {
  const router = useConceptNavigation();
  const { user } = useAuth();
  const { createItem, isPending, error, reset } = useCreateItem();

  const searchLocation = useLibrarySearchStore(state => state.location);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);

  const [itemType, setItemType] = useState(LibraryItemType.RSFORM);
  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [visible, setVisible] = useState(true);
  const [policy, setPolicy] = useState(AccessPolicy.PUBLIC);

  const [head, setHead] = useState(LocationHead.USER);
  const [body, setBody] = useState('');

  const location = combineLocation(head, body);
  const isValid = validateLocation(location);

  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    reset();
  }, [title, alias, reset]);

  function handleCancel() {
    if (router.canBack()) {
      router.back();
    } else {
      router.push(urls.library);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) {
      return;
    }
    const data: ILibraryCreateDTO = {
      item_type: itemType,
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
    setSearchLocation(location);
    createItem(data, newItem => {
      if (itemType == LibraryItemType.RSFORM) {
        router.push(urls.schema(newItem.id));
      } else {
        router.push(urls.oss(newItem.id));
      }
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

  const handleSelectLocation = useCallback((newValue: string) => {
    setHead(newValue.substring(0, 2) as LocationHead);
    setBody(newValue.length > 3 ? newValue.substring(3) : '');
  }, []);

  useEffect(() => {
    if (!searchLocation) {
      return;
    }
    handleSelectLocation(searchLocation);
  }, [searchLocation, handleSelectLocation]);

  useEffect(() => {
    if (itemType !== LibraryItemType.RSFORM) {
      setFile(undefined);
      setFileName('');
    }
  }, [itemType]);

  return (
    <form
      className={clsx('cc-fade-in cc-column', 'min-w-[30rem] max-w-[30rem] mx-auto', 'px-6 py-3')}
      onSubmit={handleSubmit}
    >
      <h1 className='select-none'>
        {itemType == LibraryItemType.RSFORM ? (
          <Overlay position='top-0 right-[0.5rem]'>
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
        ) : null}
        Создание схемы
      </h1>

      {fileName ? <Label className='text-wrap' text={`Загружен файл: ${fileName}`} /> : null}

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
          className='w-[16rem]'
          value={alias}
          onChange={event => setAlias(event.target.value)}
        />
        <div className='flex flex-col items-center gap-2'>
          <Label text='Тип схемы' className='self-center select-none' />
          <SelectItemType value={itemType} onChange={setItemType} />
        </div>

        <div className='flex flex-col gap-2'>
          <Label text='Доступ' className='self-center select-none' />
          <div className='ml-auto cc-icons'>
            <SelectAccessPolicy value={policy} onChange={setPolicy} />
            <MiniButton
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

      <div className='flex justify-between gap-3 flex-grow'>
        <div className='flex flex-col gap-2 min-w-[7rem] h-min'>
          <Label text='Корень' />
          <SelectLocationHead
            value={head}
            onChange={setHead}
            excluded={!user?.is_staff ? [LocationHead.LIBRARY] : []}
          />
        </div>
        <SelectLocationContext value={location} onChange={handleSelectLocation} />
        <TextArea
          id='dlg_cst_body'
          label='Путь'
          rows={4}
          value={body}
          onChange={event => setBody(event.target.value)}
        />
      </div>

      <div className='flex justify-around gap-6 py-3'>
        <SubmitButton text='Создать схему' loading={isPending} className='min-w-[10rem]' disabled={!isValid} />
        <Button text='Отмена' className='min-w-[10rem]' onClick={() => handleCancel()} />
      </div>
      {error ? <InfoError error={error} /> : null}
    </form>
  );
}

export default FormCreateItem;
