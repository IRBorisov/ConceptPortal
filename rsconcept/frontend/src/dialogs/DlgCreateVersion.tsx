'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { CreateVersionSchema, IVersionCreateDTO } from '@/backend/library/api';
import { useVersionCreate } from '@/backend/library/useVersionCreate';
import Checkbox from '@/components/ui/Checkbox';
import Modal from '@/components/ui/Modal';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { IVersionInfo, LibraryItemID, VersionID } from '@/models/library';
import { nextVersion } from '@/models/libraryAPI';
import { ConstituentaID } from '@/models/rsform';
import { useDialogsStore } from '@/stores/dialogs';
import { globals } from '@/utils/constants';

export interface DlgCreateVersionProps {
  itemID: LibraryItemID;
  versions: IVersionInfo[];
  onCreate: (newVersion: VersionID) => void;
  selected: ConstituentaID[];
  totalCount: number;
}

function DlgCreateVersion() {
  const {
    itemID, //
    versions,
    selected,
    totalCount,
    onCreate
  } = useDialogsStore(state => state.props as DlgCreateVersionProps);
  const { versionCreate } = useVersionCreate();

  const { register, handleSubmit, control } = useForm<IVersionCreateDTO>({
    resolver: zodResolver(CreateVersionSchema),
    defaultValues: {
      version: versions.length > 0 ? nextVersion(versions[0].version) : '1.0.0',
      description: '',
      items: undefined
    }
  });
  const version = useWatch({ control, name: 'version' });
  const canSubmit = !versions.find(ver => ver.version === version);

  function onSubmit(data: IVersionCreateDTO) {
    versionCreate({ itemID, data }, onCreate);
  }

  return (
    <Modal header='Создание версии' canSubmit={canSubmit} submitText='Создать' formID={globals.dlg_create_version}>
      <form
        id={globals.dlg_create_version}
        className={clsx('cc-column', 'w-[30rem]', 'py-2 px-6')}
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
      </form>
    </Modal>
  );
}

export default DlgCreateVersion;
