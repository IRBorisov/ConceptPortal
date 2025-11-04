'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Checkbox, TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { type ICreateVersionDTO, type IVersionInfo, schemaCreateVersion } from '../backend/types';
import { useCreateVersion } from '../backend/use-create-version';
import { nextVersion } from '../models/library-api';

export interface DlgCreateVersionProps {
  itemID: number;
  versions: IVersionInfo[];
  onCreate: (newVersion: number) => void;
  selected: number[];
  totalCount: number;
}

export function DlgCreateVersion() {
  const { itemID, versions, selected, totalCount, onCreate } = useDialogsStore(
    state => state.props as DlgCreateVersionProps
  );
  const { createVersion: versionCreate } = useCreateVersion();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ICreateVersionDTO>({
    resolver: zodResolver(schemaCreateVersion),
    defaultValues: {
      version: versions.length > 0 ? nextVersion(versions[versions.length - 1].version) : '1.0.0',
      description: '',
      items: []
    },
    mode: 'onChange'
  });
  const version = useWatch({ control, name: 'version' });
  const { canSubmit, hint } = (() => {
    if (!version) {
      return { canSubmit: false, hint: hintMsg.versionEmpty };
    } else if (versions.find(ver => ver.version === version)) {
      return { canSubmit: false, hint: hintMsg.versionTaken };
    } else {
      return { canSubmit: true, hint: '' };
    }
  })();

  function onSubmit(data: ICreateVersionDTO) {
    return versionCreate({ itemID, data }).then(onCreate);
  }

  return (
    <ModalForm
      header='Создание версии'
      className='cc-column w-120 py-2 px-6'
      canSubmit={canSubmit}
      validationHint={hint}
      submitText='Создать'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
    >
      <TextInput id='dlg_version' {...register('version')} label='Версия' className='w-64' error={errors.version} />
      <TextArea id='dlg_description' {...register('description')} spellCheck label='Описание' rows={3} />
      {selected.length > 0 ? (
        <Controller
          control={control}
          name='items'
          render={({ field }) => (
            <Checkbox
              id='dlg_only_selected'
              label={`Только выбранные конституенты [${selected.length} из ${totalCount}]`}
              value={field.value.length > 0}
              onChange={value => field.onChange(value ? selected : [])}
            />
          )}
        />
      ) : null}
    </ModalForm>
  );
}
