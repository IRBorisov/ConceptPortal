'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { HelpTopic } from '@/features/help';
import { type LibraryItem, LibraryItemType } from '@/features/library';
import { useLibrary } from '@/features/library/backend/use-library';
import { PickSchema } from '@/features/library/components/pick-schema';

import { Checkbox, TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { type ImportSchemaDTO, type OssLayout, schemaImportSchema } from '../backend/types';
import { useImportSchema } from '../backend/use-import-schema';
import { useOss } from '../backend/use-oss';
import { SelectParent } from '../components/select-parent';
import { sortItemsForOSS } from '../models/oss-api';
import { LayoutManager, OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '../models/oss-layout-api';

export interface DlgImportSchemaProps {
  ossID: number;
  layout: OssLayout;
  defaultX: number;
  defaultY: number;
  initialParent: number | null;
  onCreate?: (newID: number) => void;
}

export function DlgImportSchema() {
  const { importSchema } = useImportSchema();

  const {
    ossID,
    layout,
    initialParent,
    onCreate,
    defaultX,
    defaultY
  } = useDialogsStore(state => state.props as DlgImportSchemaProps);
  const { schema } = useOss({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);
  const { items: libraryItems } = useLibrary();
  const sortedItems = sortItemsForOSS(manager.oss, libraryItems);

  const form = useForm({
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
    } as ImportSchemaDTO,
    validators: {
      onChange: schemaImportSchema
    },
    onSubmit: ({ value }) => {
      const data = { ...value };
      data.position = manager.newOperationPosition(data);
      data.layout = manager.layout;
      void importSchema({ itemID: manager.oss.id, data }).then(response => onCreate?.(response.new_operation));
    }
  });

  const values = useStore(form.store, state => state.values);
  const alias = values.item_data.alias;
  const clone_source = values.clone_source;
  const { canSubmit, hint } = useMemo(() => {
    if (!alias) {
      return { canSubmit: false, hint: hintMsg.aliasEmpty };
    }
    if (manager.oss.operations.some(operation => operation.alias === alias)) {
      return { canSubmit: false, hint: hintMsg.schemaAliasTaken };
    }
    if (!schemaImportSchema.safeParse(values).success) {
      return { canSubmit: false, hint: hintMsg.formInvalid };
    }
    return { canSubmit: true, hint: '' };
  }, [alias, values, manager.oss.operations]);

  function baseFilter(item: LibraryItem) {
    return !manager.oss.schemas.includes(item.id);
  }

  function handleSetInput(inputID: number) {
    const libSchema = libraryItems.find(item => item.id === inputID);
    if (!libSchema) {
      return;
    }
    form.setFieldValue('source', inputID);
    form.setFieldValue('item_data.alias', libSchema.alias);
    form.setFieldValue('item_data.title', libSchema.title);
    form.setFieldValue('item_data.description', libSchema.description);
  }

  return (
    <ModalForm
      header='Создание операции: Загрузка'
      submitText='Создать'
      canSubmit={canSubmit}
      validationHint={hint}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-180 px-6 pb-3 cc-column'
      helpTopic={HelpTopic.CC_OSS}
    >
      <form.Field name='source'>
        {field => (
          <PickSchema
            items={sortedItems}
            value={field.state.value ?? 0}
            itemType={LibraryItemType.RSFORM}
            onChange={handleSetInput}
            rows={8}
            baseFilter={baseFilter}
          />
        )}
      </form.Field>
      <form.Field name='clone_source'>
        {field => (
          <Checkbox
            label='Клонировать схему'
            value={field.state.value ?? false}
            onChange={(v: boolean) => field.handleChange(v)}
          />
        )}
      </form.Field>
      <form.Field name='item_data.title'>
        {field => (
          <TextInput
            id='operation_title'
            label='Название'
            disabled={!clone_source}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
      <div className='flex gap-6'>
        <div className='flex flex-col gap-3 justify-between'>
          <form.Field name='item_data.alias'>
            {field => (
              <TextInput
                id='operation_alias'
                label='Сокращение'
                className='w-80'
                disabled={!clone_source}
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>
          <form.Field name='item_data.parent'>
            {field => (
              <SelectParent
                items={manager.oss.blocks}
                value={field.state.value ? manager.oss.blockByID.get(field.state.value) ?? null : null}
                placeholder='Родительский блок'
                onChange={value => field.handleChange(value ? value.id : null)}
              />
            )}
          </form.Field>
        </div>
        <form.Field name='item_data.description'>
          {field => (
            <TextArea
              id='operation_comment'
              label='Описание'
              rows={4}
              disabled={!clone_source}
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      </div>
    </ModalForm>
  );
}
