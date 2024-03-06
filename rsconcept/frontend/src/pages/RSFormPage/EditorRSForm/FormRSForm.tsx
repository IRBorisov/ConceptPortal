'use client';

import clsx from 'clsx';
import { useEffect, useLayoutEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Checkbox from '@/components/ui/Checkbox';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { useAuth } from '@/context/AuthContext';
import { useRSForm } from '@/context/RSFormContext';
import { LibraryItemType } from '@/models/library';
import { IRSFormCreateData } from '@/models/rsform';
import { classnames, limits, patterns } from '@/utils/constants';

interface FormRSFormProps {
  id?: string;
  disabled: boolean;
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
}

function FormRSForm({ id, disabled, isModified, setIsModified }: FormRSFormProps) {
  const { schema, update, processing } = useRSForm();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [common, setCommon] = useState(false);
  const [canonical, setCanonical] = useState(false);

  useEffect(() => {
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
  }, [
    schema,
    schema?.title,
    schema?.alias,
    schema?.comment,
    schema?.is_common,
    schema?.is_canonical,
    title,
    alias,
    comment,
    common,
    canonical,
    setIsModified
  ]);

  useLayoutEffect(() => {
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
    <form
      id={id}
      className={clsx('mt-1 min-w-[22rem] sm:w-[30rem]', 'py-1', classnames.flex_col)}
      onSubmit={handleSubmit}
    >
      <TextInput
        required
        label='Полное название'
        value={title}
        disabled={disabled}
        onChange={event => setTitle(event.target.value)}
      />
      <TextInput
        required
        label='Сокращение'
        className='w-[14rem]'
        pattern={patterns.library_alias}
        title={`не более ${limits.library_alias_len} символов`}
        disabled={disabled}
        value={alias}
        onChange={event => setAlias(event.target.value)}
      />
      <TextArea
        label='Комментарий'
        rows={3}
        value={comment}
        disabled={disabled}
        onChange={event => setComment(event.target.value)}
      />
      <div className='flex justify-between whitespace-nowrap'>
        <Checkbox
          label='Общедоступная схема'
          title='Общедоступные схемы видны всем пользователям и могут быть изменены'
          disabled={disabled}
          value={common}
          setValue={value => setCommon(value)}
        />
        <Checkbox
          label='Неизменная схема'
          title='Только администраторы могут присваивать схемам неизменный статус'
          disabled={disabled || !user?.is_staff}
          value={canonical}
          setValue={value => setCanonical(value)}
        />
      </div>
      <SubmitButton
        text='Сохранить изменения'
        className='self-center'
        loading={processing}
        disabled={!isModified || disabled}
        icon={<FiSave size='1.25rem' />}
      />
    </form>
  );
}

export default FormRSForm;
