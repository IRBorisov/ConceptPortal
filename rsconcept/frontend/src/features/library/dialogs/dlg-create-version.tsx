'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { type VersionInfo } from '@/domain/library';

import { Checkbox, TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { type CreateVersionDTO, schemaCreateVersion } from '../backend/types';
import { useCreateVersion } from '../backend/use-create-version';
import { nextVersion } from '../models/utils';

export interface DlgCreateVersionProps {
  itemID: number;
  versions: VersionInfo[];
  onCreate: (newVersion: number) => void;
  selected: number[];
  totalCount: number;
}

export function DlgCreateVersion() {
  const { itemID, versions, selected, totalCount, onCreate } = useDialogsStore(
    state => state.props as DlgCreateVersionProps
  );
  const { createVersion: versionCreate } = useCreateVersion();

  const form = useForm({
    defaultValues: {
      version: versions.length > 0 ? nextVersion(versions[versions.length - 1].version) : '1.0.0',
      description: '',
      items: [] as number[]
    } satisfies CreateVersionDTO,
    validators: {
      onChange: schemaCreateVersion
    },
    onSubmit: async ({ value }) => {
      await versionCreate({ itemID, data: value }).then(onCreate);
    }
  });

  const version = useStore(form.store, state => state.values.version);
  const { canSubmit, hint } = useMemo(() => {
    if (!version) {
      return { canSubmit: false, hint: hintMsg.versionEmpty };
    }
    if (versions.find(ver => ver.version === version)) {
      return { canSubmit: false, hint: hintMsg.versionTaken };
    }
    return { canSubmit: true, hint: '' };
  }, [version, versions]);

  return (
    <ModalForm
      header='Создание версии'
      className='cc-column w-120 py-2 px-6'
      canSubmit={canSubmit}
      validationHint={hint}
      submitText='Создать'
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
            label='Версия'
            className='w-64'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
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
      {selected.length > 0 ? (
        <form.Field name='items'>
          {field => (
            <Checkbox
              id='dlg_only_selected'
              label={`Только выбранные конституенты [${selected.length} из ${totalCount}]`}
              value={field.state.value ? field.state.value.length > 0 : false}
              onChange={value => field.handleChange(value ? selected : [])}
            />
          )}
        </form.Field>
      ) : null}
    </ModalForm>
  );
}
