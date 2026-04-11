'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { useRSForm } from '@/features/rsform/backend/use-rsform';

import { MiniButton } from '@/components/control';
import { IconReset, IconSave } from '@/components/icons';
import { TextArea, TextInput } from '@/components/input';
import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { schemaUpdateVersion, type UpdateVersionDTO } from '../../backend/types';
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
  const { schema } = useRSForm({ itemID });
  const isProcessing = useMutatingLibrary();
  const { deleteVersion: versionDelete } = useDeleteVersion();
  const { updateVersion: versionUpdate } = useUpdateVersion();

  const latest = schema.versions[schema.versions.length - 1];

  const form = useForm({
    defaultValues: {
      id: latest.id,
      version: latest.version,
      description: latest.description
    } satisfies UpdateVersionDTO,
    validators: {
      onChange: schemaUpdateVersion
    },
    onSubmit: async ({ value }) => {
      if (isProcessing || form.store.state.isDefaultValue) {
        return;
      }
      const valid =
        !!value.version && schema.versions.every(ver => ver.id === value.id || ver.version !== value.version);
      if (!valid) {
        return;
      }
      await versionUpdate({ itemID: itemID, version: value }).then(() => {
        form.reset(value);
      });
    }
  });

  const versionID = useStore(form.store, state => state.values.id);
  const versionName = useStore(form.store, state => state.values.version);
  const isDefaultValue = useStore(form.store, state => state.isDefaultValue);

  const isValid = useMemo(
    () => !!versionName && schema.versions.every(ver => ver.id === versionID || ver.version !== versionName),
    [schema, versionID, versionName]
  );

  function handleSelectVersion(targetVersion: number) {
    const ver = schema.versions.find(v => v.id === targetVersion);
    if (!ver) {
      return;
    }
    form.reset({ id: ver.id, version: ver.version, description: ver.description });
  }

  function handleDeleteVersion(targetVersion: number) {
    const nextVer = schema.versions.find(ver => ver.id !== targetVersion);
    void versionDelete({ itemID: itemID, versionID: targetVersion }).then(() => {
      if (!nextVer) {
        hideDialog();
      } else if (targetVersion === versionID) {
        form.reset({ id: nextVer.id, version: nextVer.version, description: nextVer.description });
      }
      afterDelete(targetVersion);
    });
  }

  function handleResetClick() {
    form.reset();
  }

  return (
    <ModalView header='Редактирование версий' className='flex flex-col w-160 px-6 gap-3 pb-3'>
      <TableVersions
        processing={isProcessing}
        items={schema.versions.slice().reverse()}
        onDelete={handleDeleteVersion}
        onSelect={handleSelectVersion}
        selected={versionID}
      />

      <form
        className='flex items-center '
        onSubmit={event => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name='version'>
          {field => (
            <TextInput
              id='dlg_version'
              dense
              label='Версия'
              className='w-64 mr-3'
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        <div className='cc-icons h-fit'>
          <MiniButton
            type='submit'
            title={isValid ? 'Сохранить изменения' : hintMsg.versionTaken}
            aria-label='Сохранить изменения'
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            disabled={isDefaultValue || !isValid || isProcessing}
          />
          <MiniButton
            title='Сбросить несохраненные изменения'
            onClick={handleResetClick}
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            disabled={isDefaultValue}
          />
        </div>
      </form>
      <form.Field name='description'>
        {field => (
          <TextArea
            id='dlg_description'
            spellCheck
            label='Описание'
            rows={3}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>
    </ModalView>
  );
}
