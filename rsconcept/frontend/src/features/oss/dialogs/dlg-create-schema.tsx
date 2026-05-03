'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { type OssLayout } from '@/domain/library';
import { LayoutManager, OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '@/domain/library/oss-layout-api';
import { formatLabel, formatZodErrorMessage, lid, useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';

import { TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type CreateSchemaDTO, schemaCreateSchema } from '../backend/types';
import { useCreateSchema } from '../backend/use-create-schema';
import { useOss } from '../backend/use-oss';
import { SelectParent } from '../components/select-parent';

export interface DlgCreateSchemaProps {
  ossID: number;
  layout: OssLayout;
  defaultX: number;
  defaultY: number;
  initialParent: number | null;
  onCreate?: (newID: number) => void;
}

export function DlgCreateSchema() {
  const tx = useTx();
  const { createSchema } = useCreateSchema();

  const { ossID, layout, initialParent, onCreate, defaultX, defaultY } = useDialogsStore(
    state => state.props as DlgCreateSchemaProps
  );

  const { schema } = useOss({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);

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
      layout: manager.layout
    } satisfies CreateSchemaDTO,
    validators: {
      onChange: schemaCreateSchema
    },
    onSubmit: ({ value }) => {
      const data = { ...value };
      data.position = manager.newOperationPosition(data.position, data.item_data.parent);
      data.layout = manager.layout;
      void createSchema({ itemID: manager.oss.id, data }).then(response => onCreate?.(response.new_operation));
    }
  });

  const values = useStore(form.store, state => state.values);
  const alias = values.item_data.alias;
  const { canSubmit, hint } = useMemo(() => {
    if (!alias) {
      return { canSubmit: false, hint: formatLabel(lid.hint.aliasEmpty) };
    }
    if (manager.oss.operations.some(operation => operation.alias === alias)) {
      return { canSubmit: false, hint: formatLabel(lid.hint.schemaAliasTaken) };
    }
    if (!schemaCreateSchema.safeParse(values).success) {
      return { canSubmit: false, hint: formatLabel(lid.hint.formInvalid) };
    }
    return { canSubmit: true, hint: '' };
  }, [alias, values, manager.oss.operations]);

  return (
    <ModalForm
      header={tx('ui.dlg.ossOp.newSchemaHeader')}
      submitText={tx('semantic.action.create')}
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
      <form.Field name='item_data.title'>
        {field => (
          <TextInput
            id='operation_title'
            aria-label={tx('ui.oss.newSchemaTitle')}
            placeholder={tx('ui.oss.newSchemaTitle')}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
          />
        )}
      </form.Field>
      <div className='flex gap-6'>
        <div className='flex flex-col gap-3'>
          <form.Field name='item_data.alias'>
            {field => (
              <TextInput
                id='operation_alias'
                label={tx('semantic.term.alias')}
                className='w-80'
                placeholder={tx('ui.oss.enterAlias')}
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
              />
            )}
          </form.Field>
          <form.Field name='item_data.parent'>
            {field => (
              <SelectParent
                items={manager.oss.blocks}
                value={field.state.value ? (manager.oss.blockByID.get(field.state.value) ?? null) : null}
                placeholder={tx('ui.oss.parentBlock')}
                onChange={value => field.handleChange(value ? value.id : null)}
              />
            )}
          </form.Field>
        </div>
        <form.Field name='item_data.description'>
          {field => (
            <TextArea
              id='operation_comment'
              label={tx('semantic.term.description')}
              placeholder={formatLabel(lid.placeholder.itemDescription)}
              className='w-full'
              noResize
              rows={5}
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
