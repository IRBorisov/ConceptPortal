'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useRSFormSuspense } from '@/features/rsform/backend/useRSForm';

import { MiniButton } from '@/components/Control';
import { IconReset, IconSave } from '@/components/Icons';
import { TextArea, TextInput } from '@/components/Input';
import { ModalView } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';

import { type IVersionUpdateDTO, schemaVersionUpdate } from '../../backend/types';
import { useMutatingLibrary } from '../../backend/useMutatingLibrary';
import { useVersionDelete } from '../../backend/useVersionDelete';
import { useVersionUpdate } from '../../backend/useVersionUpdate';

import { TableVersions } from './TableVersions';

export interface DlgEditVersionsProps {
  itemID: number;
  afterDelete: (targetVersion: number) => void;
}

export function DlgEditVersions() {
  const { itemID, afterDelete } = useDialogsStore(state => state.props as DlgEditVersionsProps);
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const { schema } = useRSFormSuspense({ itemID });
  const isProcessing = useMutatingLibrary();
  const { versionDelete } = useVersionDelete();
  const { versionUpdate } = useVersionUpdate();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isDirty, errors: formErrors }
  } = useForm<IVersionUpdateDTO>({
    resolver: zodResolver(schemaVersionUpdate),
    defaultValues: {
      id: schema.versions[schema.versions.length - 1].id,
      version: schema.versions[schema.versions.length - 1].version,
      description: schema.versions[schema.versions.length - 1].description
    },
    context: { schema: schema }
  });
  const versionID = useWatch({ control, name: 'id' });
  const versionName = useWatch({ control, name: 'version' });

  const isValid = useMemo(
    () => schema.versions.every(ver => ver.id === versionID || ver.version != versionName),
    [schema, versionID, versionName]
  );

  function handleSelectVersion(targetVersion: number) {
    const ver = schema.versions.find(ver => ver.id === targetVersion);
    if (!ver) {
      return;
    }
    reset({ ...ver });
  }

  function handleDeleteVersion(targetVersion: number) {
    const nextVer = schema.versions.find(ver => ver.id !== targetVersion);
    void versionDelete({ itemID: itemID, versionID: targetVersion }).then(() => {
      if (!nextVer) {
        hideDialog();
      } else if (targetVersion === versionID) {
        reset({ id: nextVer.id, version: nextVer.version, description: nextVer.description });
      }
      afterDelete(targetVersion);
    });
  }

  function onUpdate(data: IVersionUpdateDTO) {
    if (!isDirty || isProcessing || !isValid) {
      return;
    }
    void versionUpdate({ itemID: itemID, version: data }).then(() => reset({ ...data }));
  }

  return (
    <ModalView header='Редактирование версий' className='flex flex-col w-160 px-6 gap-3 pb-3'>
      <TableVersions
        processing={isProcessing}
        items={schema.versions.reverse()}
        onDelete={handleDeleteVersion}
        onSelect={handleSelectVersion}
        selected={versionID}
      />

      <form className='flex items-center ' onSubmit={event => void handleSubmit(onUpdate)(event)}>
        <TextInput
          id='dlg_version'
          {...register('version')}
          dense
          label='Версия'
          className='w-64 mr-3'
          error={formErrors.version}
        />
        <div className='cc-icons h-fit'>
          <MiniButton
            type='submit'
            title={isValid ? 'Сохранить изменения' : errorMsg.versionTaken}
            disabled={!isDirty || !isValid || isProcessing}
            icon={<IconSave size='1.25rem' className='icon-primary' />}
          />
          <MiniButton
            title='Сбросить несохраненные изменения'
            disabled={!isDirty}
            onClick={() => reset()}
            icon={<IconReset size='1.25rem' className='icon-primary' />}
          />
        </div>
      </form>
      <TextArea
        id='dlg_description' //
        {...register('description')}
        spellCheck
        label='Описание'
        rows={3}
      />
    </ModalView>
  );
}
