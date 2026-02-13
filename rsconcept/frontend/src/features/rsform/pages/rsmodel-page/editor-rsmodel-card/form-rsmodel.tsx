'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useConceptNavigation } from '@/app';
import {
  LibraryItemType,
  schemaUpdateLibraryItem,
  type UpdateLibraryItemDTO
} from '@/features/library';
import { useUpdateItem } from '@/features/library/backend/use-update-item';
import { ToolbarItemAccess } from '@/features/library/components/toolbar-item-access';

import { SubmitButton } from '@/components/control';
import { IconRSForm, IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { ValueIcon } from '@/components/view';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { useRSModelEdit } from '../rsmodel-context';

export function FormRSModel() {
  const router = useConceptNavigation();
  const { updateItem: updateSchema } = useUpdateItem();
  const setIsModified = useModificationStore(state => state.setIsModified);
  const isProcessing = useMutatingRSForm();
  const { model, isMutable } = useRSModelEdit();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { isDirty, errors }
  } = useForm<UpdateLibraryItemDTO>({
    resolver: zodResolver(schemaUpdateLibraryItem),
    defaultValues: {
      id: model.id,
      item_type: LibraryItemType.RSMODEL,
      title: model.title,
      alias: model.alias,
      description: model.description,
      visible: model.visible,
      read_only: model.read_only
    },
    mode: 'onChange'
  });
  const visible = useWatch({ control, name: 'visible' });
  const readOnly = useWatch({ control, name: 'read_only' });

  useEffect(() => {
    reset({
      id: model.id,
      item_type: LibraryItemType.RSMODEL,
      title: model.title,
      alias: model.alias,
      description: model.description,
      visible: model.visible,
      read_only: model.read_only
    });
  }, [model, reset]);

  useEffect(() => {
    setIsModified(isDirty);
  }, [isDirty, setIsModified]);

  function onSubmit(data: UpdateLibraryItemDTO) {
    return updateSchema(data).then(() => reset({ ...data }));
  }

  function handleNavigateSchema() {
    router.gotoRSForm(model.schema.id);
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
        label='Название'
        className='mb-3'
        error={errors.title}
        disabled={!isMutable}
      />
      <div className='flex justify-between gap-3 mb-3 items-center'>
        <TextInput
          id='schema_alias'
          {...register('alias')}
          label='Сокращение'
          className='w-64'
          error={errors.alias}
          disabled={!isMutable}
        />
        <ToolbarItemAccess
          className='mt-6 mr-2'
          visible={visible}
          toggleVisible={() => setValue('visible', !visible, { shouldDirty: true })}
          readOnly={readOnly}
          toggleReadOnly={() => setValue('read_only', !readOnly, { shouldDirty: true })}
          schema={model}
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
      {isMutable || isDirty ? (
        <SubmitButton
          text='Сохранить изменения'
          className='self-center mt-4'
          loading={isProcessing}
          icon={<IconSave size='1.25rem' />}
          disabled={!isDirty}
        />
      ) : null}

      <ValueIcon
        className='mt-3'
        icon={<IconRSForm size='1.25rem' className='icon-primary' />}
        value={model.schema.alias}
        title='Концептуальная схема'
        onClick={handleNavigateSchema}
        disabled={false}
      />
    </form>
  );
}
