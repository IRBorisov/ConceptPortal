'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { useTx } from '@/i18n';
import { type OssLayout } from '@rsconcept/domain/library';
import { LayoutManager, OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '@rsconcept/domain/library/oss-layout-api';

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
  const { canSubmit, hint } = (() => {
    if (!alias) {
      return { canSubmit: false, hint: tx('tx.lib.alias.validate.empty') };
    }
    if (manager.oss.operations.some(operation => operation.alias === alias)) {
      return { canSubmit: false, hint: tx('tx.lib.alias.validate.taken') };
    }
    if (!schemaCreateSchema.safeParse(values).success) {
      return { canSubmit: false, hint: tx('tx.general.form.invalid') };
    }
    return { canSubmit: true, hint: '' };
  })();

  return (
    <ModalForm
      header={tx('tx.oss.input.create.schema')}
      submitText={tx('tx.general.create')}
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
            aria-label={tx('tx.lib.title')}
            placeholder={tx('tx.lib.title')}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
      <div className='flex gap-6'>
        <div className='flex flex-col gap-3'>
          <form.Field name='item_data.alias'>
            {field => (
              <TextInput
                id='operation_alias'
                label={tx('tx.lib.alias')}
                className='w-80'
                placeholder={tx('tx.lib.alias.validate.empty')}
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
                value={field.state.value ? (manager.oss.blockByID.get(field.state.value) ?? null) : null}
                placeholder={tx('tx.oss.block.parent')}
                onChange={value => field.handleChange(value ? value.id : null)}
              />
            )}
          </form.Field>
        </div>
        <form.Field name='item_data.description'>
          {field => (
            <TextArea
              id='operation_comment'
              label={tx('tx.lib.description')}
              placeholder={tx('tx.lib.description.hint')}
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
