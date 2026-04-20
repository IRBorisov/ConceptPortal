'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { type OssLayout } from '@/domain/library';
import { LayoutManager } from '@/domain/library/oss-layout-api';

import { HelpTopic } from '@/features/help';

import { TextArea, TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { placeholderMsg } from '@/utils/labels';

import { schemaUpdateBlock, type UpdateBlockDTO } from '../backend/types';
import { useOss } from '../backend/use-oss';
import { useUpdateBlock } from '../backend/use-update-block';
import { SelectParent } from '../components/select-parent';

export interface DlgEditBlockProps {
  ossID: number;
  layout: OssLayout;
  targetID: number;
}

export function DlgEditBlock() {
  const { ossID, targetID, layout } = useDialogsStore(state => state.props as DlgEditBlockProps);
  const { updateBlock } = useUpdateBlock();
  const { schema } = useOss({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);
  const target = manager.oss.blockByID.get(targetID)!;

  const form = useForm({
    defaultValues: {
      target: target.id,
      item_data: {
        title: target.title,
        description: target.description,
        parent: target.parent
      },
      layout: manager.layout
    } satisfies UpdateBlockDTO,
    validators: {
      onChange: schemaUpdateBlock
    },
    onSubmit: async ({ value }) => {
      const data = { ...value };
      if (data.item_data.parent !== target.parent) {
        manager.onChangeParent(target.nodeID, data.item_data.parent === null ? null : `b${data.item_data.parent}`);
        data.layout = manager.layout;
      }
      await updateBlock({ itemID: manager.oss.id, data });
    }
  });

  const values = useStore(form.store, state => state.values);
  const canSubmit = useMemo(() => schemaUpdateBlock.safeParse(values).success, [values]);

  return (
    <ModalForm
      header='Редактирование блока'
      submitText='Сохранить'
      canSubmit={canSubmit}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-160 px-6 pb-2 h-fit cc-column'
      helpTopic={HelpTopic.CC_STRUCTURING}
    >
      <form.Field name='item_data.title'>
        {field => (
          <TextInput
            id='operation_title'
            placeholder='Название блока'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
      <form.Field name='item_data.parent'>
        {field => {
          const descendantNodeIDs = manager.oss.hierarchy.expandAllOutputs([target.nodeID]);
          descendantNodeIDs.push(target.nodeID);
          return (
            <SelectParent
              items={manager.oss.blocks.filter(block => !descendantNodeIDs.includes(block.nodeID))}
              value={field.state.value ? (manager.oss.blockByID.get(field.state.value) ?? null) : null}
              placeholder='Родительский блок'
              onChange={value => field.handleChange(value ? value.id : null)}
            />
          );
        }}
      </form.Field>

      <form.Field name='item_data.description'>
        {field => (
          <TextArea
            id='operation_comment'
            label='Описание'
            placeholder={placeholderMsg.itemDescription}
            noResize
            rows={5}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>
    </ModalForm>
  );
}
