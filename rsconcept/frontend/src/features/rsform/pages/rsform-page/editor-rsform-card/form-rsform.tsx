'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { urls, useConceptNavigation } from '@/app';
import {
  type CurrentVersion,
  type IUpdateLibraryItemDTO,
  LibraryItemType,
  schemaUpdateLibraryItem
} from '@/features/library';
import { useUpdateItem } from '@/features/library/backend/use-update-item';
import { SelectVersion, ToolbarItemAccess } from '@/features/library/components';

import { SubmitButton } from '@/components/control1';
import { IconSave } from '@/components/icons1';
import { Label, TextArea, TextInput } from '@/components/input1';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { useRSEdit } from '../rsedit-context';

import { ToolbarVersioning } from './toolbar-versioning';

export function FormRSForm() {
  const router = useConceptNavigation();
  const { updateItem: updateSchema } = useUpdateItem();
  const { setIsModified } = useModificationStore();
  const isProcessing = useMutatingRSForm();
  const { schema, isAttachedToOSS, isContentEditable } = useRSEdit();

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

  function handleSelectVersion(version: CurrentVersion) {
    router.push({ path: urls.schema(schema.id, version === 'latest' ? undefined : version) });
  }

  function onSubmit(data: IUpdateLibraryItemDTO) {
    return updateSchema(data).then(() => reset({ ...data }));
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
        disabled={!isContentEditable}
        error={errors.title}
      />
      <div className='flex justify-between gap-3 mb-3'>
        <TextInput
          id='schema_alias'
          {...register('alias')}
          label='Сокращение'
          className='w-64'
          disabled={!isContentEditable}
          error={errors.alias}
        />
        <div className='relative flex flex-col gap-2'>
          <ToolbarVersioning
            className='absolute -top-2 right-2' //
            blockReload={schema.oss.length > 0}
          />

          <Label text='Версия' className='select-none w-fit' />
          <SelectVersion
            id='schema_version'
            className='select-none'
            value={schema.version} //
            items={schema.versions}
            onChange={handleSelectVersion}
          />

          <ToolbarItemAccess
            className='absolute top-18 right-2'
            visible={visible}
            toggleVisible={() => setValue('visible', !visible, { shouldDirty: true })}
            readOnly={readOnly}
            toggleReadOnly={() => setValue('read_only', !readOnly, { shouldDirty: true })}
            schema={schema}
            isAttachedToOSS={isAttachedToOSS}
          />
        </div>
      </div>

      <TextArea
        id='schema_comment'
        {...register('comment')}
        label='Описание'
        rows={3}
        disabled={!isContentEditable || isProcessing}
        error={errors.comment}
      />
      {isContentEditable || isDirty ? (
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
