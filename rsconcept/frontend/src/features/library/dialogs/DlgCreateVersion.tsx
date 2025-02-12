'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Checkbox, TextArea, TextInput } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';

import { IVersionCreateDTO, schemaVersionCreate } from '../backend/types';
import { useVersionCreate } from '../backend/useVersionCreate';
import { IVersionInfo } from '../models/library';
import { nextVersion } from '../models/libraryAPI';

export interface DlgCreateVersionProps {
  itemID: number;
  versions: IVersionInfo[];
  onCreate: (newVersion: number) => void;
  selected: number[];
  totalCount: number;
}

function DlgCreateVersion() {
  const { itemID, versions, selected, totalCount, onCreate } = useDialogsStore(
    state => state.props as DlgCreateVersionProps
  );
  const { versionCreate } = useVersionCreate();

  const { register, handleSubmit, control } = useForm<IVersionCreateDTO>({
    resolver: zodResolver(schemaVersionCreate),
    defaultValues: {
      version: versions.length > 0 ? nextVersion(versions[0].version) : '1.0.0',
      description: '',
      items: undefined
    }
  });
  const version = useWatch({ control, name: 'version' });
  const canSubmit = !versions.find(ver => ver.version === version);

  function onSubmit(data: IVersionCreateDTO) {
    return versionCreate({ itemID, data }).then(onCreate);
  }

  return (
    <ModalForm
      header='Создание версии'
      className={clsx('cc-column', 'w-[30rem]', 'py-2 px-6')}
      canSubmit={canSubmit}
      submitInvalidTooltip={errorMsg.versionTaken}
      submitText='Создать'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
    >
      <TextInput id='dlg_version' {...register('version')} dense label='Версия' className='w-[16rem]' />
      <TextArea id='dlg_description' {...register('description')} spellCheck label='Описание' rows={3} />
      {selected.length > 0 ? (
        <Controller
          control={control}
          name='items'
          render={({ field }) => (
            <Checkbox
              id='dlg_only_selected'
              label={`Только выбранные конституенты [${selected.length} из ${totalCount}]`}
              value={field.value !== undefined}
              onChange={value => field.onChange(value ? selected : undefined)}
            />
          )}
        />
      ) : null}
    </ModalForm>
  );
}

export default DlgCreateVersion;
