'use client';

import { type ReactNode } from 'react';

import { TextArea, TextInput } from '@/components/input';
import { type CreateFieldProps } from '@/utils/forms';

import { SelectParent } from '../../components/select-parent';
import { NodeType, type OperationSchema } from '../../models/oss';
import { constructNodeID } from '../../models/oss-api';

export interface DlgCreateBlockCardFields {
  TitleField: (props: CreateFieldProps<string>) => ReactNode;
  ParentField: (props: CreateFieldProps<number | null>) => ReactNode;
  DescriptionField: (props: CreateFieldProps<string>) => ReactNode;
}

interface TabBlockCardProps {
  oss: OperationSchema;
  blocks: number[];
  fields: DlgCreateBlockCardFields;
}

export function TabBlockCard({ oss, blocks, fields }: TabBlockCardProps) {
  const block_ids = blocks.map(id => constructNodeID(NodeType.BLOCK, id));
  const all_children = [...block_ids, ...oss.hierarchy.expandAllOutputs(block_ids)];
  const { TitleField, ParentField, DescriptionField } = fields;

  return (
    <div className='cc-fade-in cc-column'>
      <TitleField>
        {field => (
          <TextInput
            id='operation_title'
            label='Название'
            placeholder='Введите название'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </TitleField>

      <ParentField>
        {field => (
          <SelectParent
            items={oss.blocks.filter(block => !all_children.includes(block.nodeID))}
            value={field.state.value ? (oss.blockByID.get(field.state.value) ?? null) : null}
            placeholder='Родительский блок'
            onChange={value => field.handleChange(value ? value.id : null)}
          />
        )}
      </ParentField>

      <DescriptionField>
        {field => (
          <TextArea
            id='operation_comment'
            label='Описание'
            noResize
            rows={5}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </DescriptionField>
    </div>
  );
}
