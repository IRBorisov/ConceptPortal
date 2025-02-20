'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import { LibraryItemType, ToolbarItemAccess, useUpdateItem } from '@/features/library';
import { IUpdateLibraryItemDTO, schemaUpdateLibraryItem } from '@/features/library/backend/types';

import { SubmitButton } from '@/components/Control';
import { IconSave } from '@/components/Icons';
import { TextArea, TextInput } from '@/components/Input';
import { useModificationStore } from '@/stores/modification';
import { globals } from '@/utils/constants';

import { useMutatingOss } from '../../../backend/useMutatingOss';
import { useOssEdit } from '../OssEditContext';

export function FormOSS() {
  const { updateItem: updateOss } = useUpdateItem();
  const { isModified, setIsModified } = useModificationStore();
  const isProcessing = useMutatingOss();
  const { schema, isMutable } = useOssEdit();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { isDirty, errors }
  } = useForm<IUpdateLibraryItemDTO>({
    resolver: zodResolver(schemaUpdateLibraryItem),
    defaultValues: {
      id: schema.id,
      item_type: LibraryItemType.RSFORM,
      title: schema.title,
      alias: schema.alias,
      comment: schema.comment,
      visible: schema.visible,
      read_only: schema.read_only
    }
  });
  const visible = useWatch({ control, name: 'visible' });
  const readOnly = useWatch({ control, name: 'read_only' });

  useEffect(() => {
    setIsModified(isDirty);
  }, [isDirty, setIsModified]);

  function onSubmit(data: IUpdateLibraryItemDTO) {
    return updateOss(data).then(() => reset({ ...data }));
  }

  return (
    <form
      id={globals.library_item_editor}
      className={clsx('mt-1 min-w-[22rem] sm:w-[30rem]', 'flex flex-col pt-1')}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
    >
      <TextInput
        id='schema_title'
        {...register('title')}
        label='Полное название'
        className='mb-3'
        disabled={!isMutable}
        error={errors.title}
      />
      <div className='flex justify-between gap-3 mb-3'>
        <TextInput
          id='schema_alias'
          {...register('alias')}
          label='Сокращение'
          className='w-[16rem]'
          disabled={!isMutable}
          error={errors.alias}
        />
        <ToolbarItemAccess
          visible={visible}
          toggleVisible={() => setValue('visible', !visible, { shouldDirty: true })}
          readOnly={readOnly}
          toggleReadOnly={() => setValue('read_only', !readOnly, { shouldDirty: true })}
          schema={schema}
          isAttachedToOSS={false}
        />
      </div>

      <TextArea
        id='schema_comment'
        {...register('comment')}
        label='Описание'
        rows={3}
        disabled={!isMutable || isProcessing}
        error={errors.comment}
      />
      {isMutable || isModified ? (
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
