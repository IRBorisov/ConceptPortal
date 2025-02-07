'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { IUpdateLibraryItemDTO, UpdateLibraryItemSchema } from '@/backend/library/api';
import { useUpdateItem } from '@/backend/library/useUpdateItem';
import { useMutatingOss } from '@/backend/oss/useMutatingOss';
import { IconSave } from '@/components/Icons';
import { SubmitButton } from '@/components/ui/Control';
import { TextArea, TextInput } from '@/components/ui/Input';
import { LibraryItemType } from '@/models/library';
import ToolbarItemAccess from '@/pages/RSFormPage/EditorRSFormCard/ToolbarItemAccess';
import { useModificationStore } from '@/stores/modification';
import { globals } from '@/utils/constants';

import { useOssEdit } from '../OssEditContext';

function FormOSS() {
  const { updateItem: updateOss } = useUpdateItem();
  const controller = useOssEdit();
  const { isModified, setIsModified } = useModificationStore();
  const isProcessing = useMutatingOss();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { isDirty, errors }
  } = useForm<IUpdateLibraryItemDTO>({
    resolver: zodResolver(UpdateLibraryItemSchema),
    defaultValues: {
      id: controller.schema.id,
      item_type: LibraryItemType.RSFORM,
      title: controller.schema.title,
      alias: controller.schema.alias,
      comment: controller.schema.comment,
      visible: controller.schema.visible,
      read_only: controller.schema.read_only
    }
  });
  const visible = useWatch({ control, name: 'visible' });
  const readOnly = useWatch({ control, name: 'read_only' });

  useEffect(() => {
    setIsModified(isDirty);
  }, [isDirty, setIsModified]);

  function onSubmit(data: IUpdateLibraryItemDTO) {
    updateOss(data, () => reset({ ...data }));
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
        disabled={!controller.isMutable}
        error={errors.title}
      />
      <div className='flex justify-between gap-3 mb-3'>
        <TextInput
          id='schema_alias'
          {...register('alias')}
          label='Сокращение'
          className='w-[16rem]'
          disabled={!controller.isMutable}
          error={errors.alias}
        />
        <ToolbarItemAccess
          visible={visible}
          toggleVisible={() => setValue('visible', !visible, { shouldDirty: true })}
          readOnly={readOnly}
          toggleReadOnly={() => setValue('read_only', !readOnly, { shouldDirty: true })}
          controller={controller}
        />
      </div>

      <TextArea
        id='schema_comment'
        {...register('comment')}
        label='Описание'
        rows={3}
        disabled={!controller.isMutable || isProcessing}
        error={errors.comment}
      />
      {controller.isMutable || isModified ? (
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

export default FormOSS;
