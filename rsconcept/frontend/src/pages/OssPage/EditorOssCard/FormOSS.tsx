'use client';

import clsx from 'clsx';
import { useEffect, useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { IconSave } from '@/components/Icons';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { useOSS } from '@/context/OssContext';
import { ILibraryUpdateData, LibraryItemType } from '@/models/library';
import AccessToolbar from '@/pages/RSFormPage/EditorRSFormCard/AccessToolbar';
import { limits, patterns } from '@/utils/constants';

import { useOssEdit } from '../OssEditContext';

interface FormOSSProps {
  id?: string;
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
}

function FormOSS({ id, isModified, setIsModified }: FormOSSProps) {
  const { schema, update, processing } = useOSS();
  const controller = useOssEdit();

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [comment, setComment] = useState('');
  const [visible, setVisible] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (!schema) {
      setIsModified(false);
      return;
    }
    setIsModified(
      schema.title !== title ||
        schema.alias !== alias ||
        schema.comment !== comment ||
        schema.visible !== visible ||
        schema.read_only !== readOnly
    );
    return () => setIsModified(false);
  }, [
    schema,
    schema?.title,
    schema?.alias,
    schema?.comment,
    schema?.visible,
    schema?.read_only,
    title,
    alias,
    comment,
    visible,
    readOnly,
    setIsModified
  ]);

  useLayoutEffect(() => {
    if (schema) {
      setTitle(schema.title);
      setAlias(schema.alias);
      setComment(schema.comment);
      setVisible(schema.visible);
      setReadOnly(schema.read_only);
    }
  }, [schema]);

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    const data: ILibraryUpdateData = {
      item_type: LibraryItemType.RSFORM,
      title: title,
      alias: alias,
      comment: comment,
      visible: visible,
      read_only: readOnly
    };
    update(data, () => toast.success('Изменения сохранены'));
  };

  return (
    <form id={id} className={clsx('mt-1 min-w-[22rem] sm:w-[30rem]', 'flex flex-col pt-1')} onSubmit={handleSubmit}>
      <TextInput
        id='schema_title'
        required
        label='Полное название'
        className='mb-3'
        value={title}
        disabled={!controller.isMutable}
        onChange={event => setTitle(event.target.value)}
      />
      <div className='flex justify-between w-full gap-3 mb-3'>
        <TextInput
          id='schema_alias'
          required
          label='Сокращение'
          className='w-[14rem]'
          pattern={patterns.library_alias}
          title={`не более ${limits.library_alias_len} символов`}
          disabled={!controller.isMutable}
          value={alias}
          onChange={event => setAlias(event.target.value)}
        />
        <AccessToolbar
          visible={visible}
          toggleVisible={() => setVisible(prev => !prev)}
          readOnly={readOnly}
          toggleReadOnly={() => setReadOnly(prev => !prev)}
          controller={controller}
        />
      </div>

      <TextArea
        id='schema_comment'
        label='Описание'
        rows={3}
        value={comment}
        disabled={!controller.isMutable || controller.isProcessing}
        onChange={event => setComment(event.target.value)}
      />
      {controller.isMutable || isModified ? (
        <SubmitButton
          text='Сохранить изменения'
          className='self-center mt-4'
          loading={processing}
          disabled={!isModified}
          icon={<IconSave size='1.25rem' />}
        />
      ) : null}
    </form>
  );
}

export default FormOSS;
