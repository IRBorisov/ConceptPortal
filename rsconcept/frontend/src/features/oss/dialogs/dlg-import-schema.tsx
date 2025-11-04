'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';
import { type ILibraryItem, LibraryItemType } from '@/features/library';
import { useLibrary } from '@/features/library/backend/use-library';
import { PickSchema } from '@/features/library/components/pick-schema';

import { Checkbox, TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { type IImportSchemaDTO, type IOssLayout, schemaImportSchema } from '../backend/types';
import { useImportSchema } from '../backend/use-import-schema';
import { useOssSuspense } from '../backend/use-oss';
import { SelectParent } from '../components/select-parent';
import { sortItemsForOSS } from '../models/oss-api';
import { LayoutManager, OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '../models/oss-layout-api';

export interface DlgImportSchemaProps {
  ossID: number;
  layout: IOssLayout;
  defaultX: number;
  defaultY: number;
  initialParent: number | null;
  onCreate?: (newID: number) => void;
}

export function DlgImportSchema() {
  const { importSchema } = useImportSchema();

  const {
    ossID, //
    layout,
    initialParent,
    onCreate,
    defaultX,
    defaultY
  } = useDialogsStore(state => state.props as DlgImportSchemaProps);
  const { schema } = useOssSuspense({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);
  const { items: libraryItems } = useLibrary();
  const sortedItems = sortItemsForOSS(manager.oss, libraryItems);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid }
  } = useForm<IImportSchemaDTO>({
    resolver: zodResolver(schemaImportSchema),
    defaultValues: {
      item_data: {
        alias: '',
        title: '',
        description: '',
        parent: initialParent
      },
      position: {
        x: defaultX,
        y: defaultY,
        width: OPERATION_NODE_WIDTH,
        height: OPERATION_NODE_HEIGHT
      },
      layout: manager.layout,
      source: 0,
      clone_source: false
    },
    mode: 'onChange'
  });
  const alias = useWatch({ control: control, name: 'item_data.alias' });
  const clone_source = useWatch({ control: control, name: 'clone_source' });
  const { canSubmit, hint } = (() => {
    if (!isValid) {
      return { canSubmit: false, hint: hintMsg.formInvalid };
    } else if (!alias) {
      return { canSubmit: false, hint: hintMsg.aliasEmpty };
    } else if (manager.oss.operations.some(operation => operation.alias === alias)) {
      return { canSubmit: false, hint: hintMsg.schemaAliasTaken };
    } else {
      return { canSubmit: true, hint: '' };
    }
  })();

  function onSubmit(data: IImportSchemaDTO) {
    data.position = manager.newOperationPosition(data);
    data.layout = manager.layout;
    void importSchema({ itemID: manager.oss.id, data: data }).then(response => onCreate?.(response.new_operation));
  }

  function baseFilter(item: ILibraryItem) {
    return !manager.oss.schemas.includes(item.id);
  }

  function handleSetInput(inputID: number) {
    const schema = libraryItems.find(item => item.id === inputID);
    if (!schema) {
      return;
    }
    setValue('source', inputID);
    setValue('item_data.alias', schema.alias);
    setValue('item_data.title', schema.title);
    setValue('item_data.description', schema.description, { shouldValidate: true });
  }

  return (
    <ModalForm
      header='Создание операции: Загрузка'
      submitText='Создать'
      canSubmit={canSubmit}
      validationHint={hint}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className='w-180 px-6 pb-3 cc-column'
      helpTopic={HelpTopic.CC_OSS}
    >
      <Controller
        control={control}
        name='source'
        render={({ field }) => (
          <PickSchema
            items={sortedItems}
            value={field.value}
            itemType={LibraryItemType.RSFORM}
            onChange={handleSetInput}
            rows={8}
            baseFilter={baseFilter}
          />
        )}
      />
      <Controller
        control={control}
        name='clone_source'
        render={({ field }) => <Checkbox label='Клонировать схему' value={field.value} onChange={field.onChange} />}
      />
      <TextInput
        id='operation_title' //
        label='Название'
        disabled={!clone_source}
        {...register('item_data.title')}
        error={errors.item_data?.title}
      />
      <div className='flex gap-6'>
        <div className='flex flex-col gap-3 justify-between'>
          <TextInput
            id='operation_alias' //
            label='Сокращение'
            className='w-80'
            disabled={!clone_source}
            {...register('item_data.alias')}
            error={errors.item_data?.alias}
          />
          <Controller
            name='item_data.parent'
            control={control}
            render={({ field }) => (
              <SelectParent
                items={manager.oss.blocks}
                value={field.value ? manager.oss.blockByID.get(field.value) ?? null : null}
                placeholder='Родительский блок'
                onChange={value => field.onChange(value ? value.id : null)}
              />
            )}
          />
        </div>
        <TextArea
          id='operation_comment' //
          label='Описание'
          rows={4}
          disabled={!clone_source}
          {...register('item_data.description')}
        />
      </div>
    </ModalForm>
  );
}
