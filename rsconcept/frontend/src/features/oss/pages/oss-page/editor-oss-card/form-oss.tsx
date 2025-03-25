'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { type IUpdateLibraryItemDTO, LibraryItemType, schemaUpdateLibraryItem } from '@/features/library';
import { useUpdateItem } from '@/features/library/backend/use-update-item';
import { ToolbarItemAccess } from '@/features/library/components';

import { SubmitButton } from '@/components/control';
import { IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useOssEdit } from '../oss-edit-context';

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
      description: schema.description,
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
      id={globalIDs.library_item_editor}
      className='mt-1 min-w-88 sm:w-120 flex flex-col pt-1'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
    >
      <TextInput
        id='schema_title'
        {...register('title')}
        label='Полное название'
        className='mb-3'
        error={errors.title}
        disabled={!isMutable}
      />
      <div className='relative flex justify-between gap-3 mb-3'>
        <TextInput
          id='schema_alias'
          {...register('alias')}
          label='Сокращение'
          className='w-64'
          error={errors.alias}
          disabled={!isMutable}
        />
        <ToolbarItemAccess
          className='absolute top-18 right-2'
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
        {...register('description')}
        label='Описание'
        rows={3}
        error={errors.description}
        disabled={!isMutable || isProcessing}
      />
      {isMutable || isModified ? (
        <SubmitButton
          text='Сохранить изменения'
          className='self-center mt-4'
          loading={isProcessing}
          icon={<IconSave size='1.25rem' />}
          disabled={!isModified}
        />
      ) : null}
    </form>
  );
}
