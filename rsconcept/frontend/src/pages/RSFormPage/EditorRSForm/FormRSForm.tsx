'use client';

import { Dispatch, SetStateAction, useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Checkbox from '@/components/Common/Checkbox';
import SubmitButton from '@/components/Common/SubmitButton';
import TextArea from '@/components/Common/TextArea';
import TextInput from '@/components/Common/TextInput';
import { SaveIcon } from '@/components/Icons';
import { useRSForm } from '@/context/RSFormContext';
import { LibraryItemType } from '@/models/library';
import { IRSFormCreateData } from '@/models/rsform';
import { limits, patterns } from '@/utils/constants';

interface FormRSFormProps {
  id?: string
  isModified: boolean
  setIsModified: Dispatch<SetStateAction<boolean>>
}

function FormRSForm({
  id, isModified, setIsModified,
}: FormRSFormProps) {
  const {
    schema, update, adminMode: adminMode,
    isMutable: isMutable, processing
  } = useRSForm();
  
  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);
  const [canonical, setCanonical] = useState(false);

  useLayoutEffect(
  () => {
    if (!schema) {
      setIsModified(false);
      return;
    }
    setIsModified(
      schema.title !== title ||
      schema.alias !== alias ||
      schema.comment !== comment ||
      schema.is_common !== common ||
      schema.is_canonical !== canonical
    );
    return () => setIsModified(false);
  }, [schema, schema?.title, schema?.alias, schema?.comment,
      schema?.is_common, schema?.is_canonical,
      title, alias, comment, common, canonical, setIsModified]);

  useLayoutEffect(
  () => {
    if (schema) {
      setTitle(schema.title);
      setAlias(schema.alias);
      setComment(schema.comment);
      setCommon(schema.is_common);
      setCanonical(schema.is_canonical);
    }
  }, [schema]);

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    const data: IRSFormCreateData = {
      item_type: LibraryItemType.RSFORM,
      title: title,
      alias: alias,
      comment: comment,
      is_common: common,
      is_canonical: canonical
    };
    update(data, () => toast.success('Изменения сохранены'));
  };

  return (
  <form id={id}
    className='flex flex-col gap-3 mt-2'
    onSubmit={handleSubmit}
  >
    <TextInput required
      label='Полное название'
      value={title}
      disabled={!isMutable}
      onChange={event => setTitle(event.target.value)}
    />
    <TextInput required
      label='Сокращение' 
      dimensions='w-[14rem]'
      pattern={patterns.alias}
      tooltip={`не более ${limits.alias_len} символов`}
      disabled={!isMutable}
      value={alias}
      onChange={event => setAlias(event.target.value)}
    />
    <TextArea
      label='Комментарий'
      value={comment}
      disabled={!isMutable}
      onChange={event => setComment(event.target.value)}
    />
    <div className='flex justify-between whitespace-nowrap'>
      <Checkbox
        label='Общедоступная схема'
        tooltip='Общедоступные схемы видны всем пользователям и могут быть изменены'
        dimensions='w-fit'
        disabled={!isMutable}
        value={common}
        setValue={value => setCommon(value)}
      />
      <Checkbox
        label='Неизменная схема'
        tooltip='Только администраторы могут присваивать схемам неизменный статус'
        dimensions='w-fit'
        disabled={!isMutable || !adminMode}
        value={canonical}
        setValue={value => setCanonical(value)}
      />
    </div>
    <div className='flex justify-center w-full'>
      <SubmitButton
        text='Сохранить изменения'
        loading={processing}
        disabled={!isModified || !isMutable}
        icon={<SaveIcon size={6} />}
        dimensions='my-2 w-fit'
      />
    </div>
  </form>);
}

export default FormRSForm;