'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { IVersionUpdateDTO, VersionUpdateSchema } from '@/backend/library/api';
import { useMutatingLibrary } from '@/backend/library/useMutatingLibrary';
import { useVersionDelete } from '@/backend/library/useVersionDelete';
import { useVersionUpdate } from '@/backend/library/useVersionUpdate';
import { useRSFormSuspense } from '@/backend/rsform/useRSForm';
import { IconReset, IconSave } from '@/components/Icons';
import { MiniButton } from '@/components/ui/Control';
import { TextArea, TextInput } from '@/components/ui/Input';
import { ModalView } from '@/components/ui/Modal';
import { LibraryItemID, VersionID } from '@/models/library';
import { useDialogsStore } from '@/stores/dialogs';
import { errors } from '@/utils/labels';

import TableVersions from './TableVersions';

export interface DlgEditVersionsProps {
  itemID: LibraryItemID;
  afterDelete: (targetVersion: VersionID) => void;
}

function DlgEditVersions() {
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
    resolver: zodResolver(VersionUpdateSchema),
    defaultValues: {
      id: schema.versions[0].id,
      version: schema.versions[0].version,
      description: schema.versions[0].description
    },
    context: { schema: schema }
  });
  const versionID = useWatch({ control, name: 'id' });
  const versionName = useWatch({ control, name: 'version' });

  const isValid = useMemo(
    () => schema.versions.every(ver => ver.id === versionID || ver.version != versionName),
    [schema, versionID, versionName]
  );

  function handleSelectVersion(targetVersion: VersionID) {
    const ver = schema.versions.find(ver => ver.id === targetVersion);
    if (!ver) {
      return;
    }
    reset({ ...ver });
  }

  function handleDeleteVersion(targetVersion: VersionID) {
    const nextVer = schema.versions.find(ver => ver.id !== targetVersion);
    versionDelete({ itemID: itemID, versionID: targetVersion }, () => {
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
    versionUpdate(data, () => reset({ ...data }));
  }

  return (
    <ModalView header='Редактирование версий' className='flex flex-col w-[40rem] px-6 gap-3 pb-6'>
      <TableVersions
        processing={isProcessing}
        items={schema.versions}
        onDelete={handleDeleteVersion}
        onSelect={handleSelectVersion}
        selected={versionID}
      />

      <form className='flex' onSubmit={event => void handleSubmit(onUpdate)(event)}>
        <TextInput
          id='dlg_version'
          {...register('version')}
          dense
          label='Версия'
          className='w-[16rem] mr-3'
          error={formErrors.version}
        />
        <div className='cc-icons'>
          <MiniButton
            type='submit'
            title={isValid ? 'Сохранить изменения' : errors.versionTaken}
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

export default DlgEditVersions;
