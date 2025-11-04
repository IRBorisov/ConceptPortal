'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useRSFormSuspense } from '@/features/rsform/backend/use-rsform';

import { MiniButton } from '@/components/control';
import { IconReset, IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { type IUpdateVersionDTO, schemaUpdateVersion } from '../../backend/types';
import { useDeleteVersion } from '../../backend/use-delete-version';
import { useMutatingLibrary } from '../../backend/use-mutating-library';
import { useUpdateVersion } from '../../backend/use-update-version';

import { TableVersions } from './table-versions';

export interface DlgEditVersionsProps {
  itemID: number;
  afterDelete: (targetVersion: number) => void;
}

export function DlgEditVersions() {
  const { itemID, afterDelete } = useDialogsStore(state => state.props as DlgEditVersionsProps);
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const { schema } = useRSFormSuspense({ itemID });
  const isProcessing = useMutatingLibrary();
  const { deleteVersion: versionDelete } = useDeleteVersion();
  const { updateVersion: versionUpdate } = useUpdateVersion();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isDirty, errors: formErrors }
  } = useForm<IUpdateVersionDTO>({
    resolver: zodResolver(schemaUpdateVersion),
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
    () => !!versionName && schema.versions.every(ver => ver.id === versionID || ver.version != versionName),
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

  function onUpdate(data: IUpdateVersionDTO) {
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
            title={isValid ? 'Сохранить изменения' : hintMsg.versionTaken}
            aria-label='Сохранить изменения'
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            disabled={!isDirty || !isValid || isProcessing}
          />
          <MiniButton
            title='Сбросить несохраненные изменения'
            onClick={() => reset()}
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            disabled={!isDirty}
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
