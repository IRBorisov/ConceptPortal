'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { ILibraryUpdateDTO } from '@/backend/library/api';
import { useUpdateItem } from '@/backend/library/useUpdateItem';
import { useMutatingRSForm } from '@/backend/rsform/useMutatingRSForm';
import { IconSave } from '@/components/Icons';
import SelectVersion from '@/components/select/SelectVersion';
import Label from '@/components/ui/Label';
import SubmitButton from '@/components/ui/SubmitButton';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { LibraryItemType, VersionID } from '@/models/library';
import { useModificationStore } from '@/stores/modification';

import { useRSEdit } from '../RSEditContext';
import ToolbarItemAccess from './ToolbarItemAccess';
import ToolbarVersioning from './ToolbarVersioning';

interface FormRSFormProps {
  id?: string;
}

function FormRSForm({ id }: FormRSFormProps) {
  const controller = useRSEdit();
  const router = useConceptNavigation();
  const schema = controller.schema;
  const { updateItem: update } = useUpdateItem();
  const { isModified, setIsModified } = useModificationStore();
  const isProcessing = useMutatingRSForm();

  const [title, setTitle] = useState(schema.title);
  const [alias, setAlias] = useState(schema.alias);
  const [comment, setComment] = useState(schema.comment);
  const [visible, setVisible] = useState(schema.visible);
  const [readOnly, setReadOnly] = useState(schema.read_only);

  function handleSelectVersion(version?: VersionID) {
    router.push(urls.schema(schema.id, version));
  }

  useEffect(() => {
    if (schema) {
      setTitle(schema.title);
      setAlias(schema.alias);
      setComment(schema.comment);
      setVisible(schema.visible);
      setReadOnly(schema.read_only);
    }
  }, [schema]);

  useEffect(() => {
    setIsModified(
      schema.title !== title ||
        schema.alias !== alias ||
        schema.comment !== comment ||
        schema.visible !== visible ||
        schema.read_only !== readOnly
    );
    return () => setIsModified(false);
  }, [
    schema.title,
    schema.alias,
    schema.comment,
    schema.visible,
    schema.read_only,
    title,
    alias,
    comment,
    visible,
    readOnly,
    setIsModified
  ]);

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    if (!schema) {
      return;
    }
    const data: ILibraryUpdateDTO = {
      id: schema.id,
      item_type: LibraryItemType.RSFORM,
      title: title,
      alias: alias,
      comment: comment,
      visible: visible,
      read_only: readOnly
    };
    update(data);
  };

  return (
    <form id={id} className={clsx('mt-1 min-w-[22rem] sm:w-[30rem]', 'flex flex-col pt-1')} onSubmit={handleSubmit}>
      <TextInput
        id='schema_title'
        required
        label='Полное название'
        className='mb-3'
        value={title}
        disabled={!controller.isContentEditable}
        onChange={event => setTitle(event.target.value)}
      />
      <div className='flex justify-between gap-3 mb-3'>
        <TextInput
          id='schema_alias'
          required
          label='Сокращение'
          className='w-[16rem]'
          disabled={!controller.isContentEditable}
          value={alias}
          onChange={event => setAlias(event.target.value)}
        />
        <div className='flex flex-col'>
          <ToolbarVersioning blockReload={schema.oss.length > 0} />
          <ToolbarItemAccess
            visible={visible}
            toggleVisible={() => setVisible(prev => !prev)}
            readOnly={readOnly}
            toggleReadOnly={() => setReadOnly(prev => !prev)}
            controller={controller}
          />
          <Label text='Версия' className='mb-2 select-none' />
          <SelectVersion
            id='schema_version'
            className='select-none'
            value={schema.version} //
            items={schema.versions}
            onSelectValue={handleSelectVersion}
          />
        </div>
      </div>

      <TextArea
        id='schema_comment'
        label='Описание'
        rows={3}
        value={comment}
        disabled={!controller.isContentEditable || isProcessing}
        onChange={event => setComment(event.target.value)}
      />
      {controller.isContentEditable || isModified ? (
        <SubmitButton
          text='Сохранить изменения'
          className='self-center mt-4'
          loading={isProcessing}
          disabled={!isModified}
          icon={<IconSave size='1.25rem' />}
        />
      ) : null}
    </form>
  );
}

export default FormRSForm;
