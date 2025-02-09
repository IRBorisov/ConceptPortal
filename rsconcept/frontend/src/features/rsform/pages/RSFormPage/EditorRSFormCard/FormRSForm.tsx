'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { urls, useConceptNavigation } from '@/app';
import { SubmitButton } from '@/components/Control';
import { IconSave } from '@/components/Icons';
import { Label, TextArea, TextInput } from '@/components/Input';
import { IUpdateLibraryItemDTO, UpdateLibraryItemSchema } from '@/features/library/backend/api';
import { useUpdateItem } from '@/features/library/backend/useUpdateItem';
import { LibraryItemType, VersionID } from '@/features/library/models/library';
import { useModificationStore } from '@/stores/modification';
import { globals } from '@/utils/constants';

import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import SelectVersion from '../../../components/SelectVersion';
import { useRSEdit } from '../RSEditContext';
import ToolbarItemAccess from './ToolbarItemAccess';
import ToolbarVersioning from './ToolbarVersioning';

function FormRSForm() {
  const controller = useRSEdit();
  const router = useConceptNavigation();
  const { updateItem: updateSchema } = useUpdateItem();
  const { setIsModified } = useModificationStore();
  const isProcessing = useMutatingRSForm();

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

  function handleSelectVersion(version?: VersionID) {
    router.push(urls.schema(controller.schema.id, version));
  }

  function onSubmit(data: IUpdateLibraryItemDTO) {
    updateSchema(data, () => reset({ ...data }));
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
        disabled={!controller.isContentEditable}
        error={errors.title}
      />
      <div className='flex justify-between gap-3 mb-3'>
        <TextInput
          id='schema_alias'
          {...register('alias')}
          label='Сокращение'
          className='w-[16rem]'
          disabled={!controller.isContentEditable}
          error={errors.alias}
        />
        <div className='flex flex-col'>
          <ToolbarVersioning blockReload={controller.schema.oss.length > 0} />
          <ToolbarItemAccess
            visible={visible}
            toggleVisible={() => setValue('visible', !visible, { shouldDirty: true })}
            readOnly={readOnly}
            toggleReadOnly={() => setValue('read_only', !readOnly, { shouldDirty: true })}
            controller={controller}
          />
          <Label text='Версия' className='mb-2 select-none' />
          <SelectVersion
            id='schema_version'
            className='select-none'
            value={controller.schema.version} //
            items={controller.schema.versions}
            onChange={handleSelectVersion}
          />
        </div>
      </div>

      <TextArea
        id='schema_comment'
        {...register('comment')}
        label='Описание'
        rows={3}
        disabled={!controller.isContentEditable || isProcessing}
        error={errors.comment}
      />
      {controller.isContentEditable || isDirty ? (
        <SubmitButton
          text='Сохранить изменения'
          className='self-center mt-4'
          loading={isProcessing}
          disabled={!isDirty}
          icon={<IconSave size='1.25rem' />}
        />
      ) : null}
    </form>
  );
}

export default FormRSForm;
