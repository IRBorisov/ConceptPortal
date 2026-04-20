'use client';

import { type ReactNode } from 'react';

import { type OperationSchema } from '@/domain/library';
import { NodeType } from '@/domain/library';
import { constructNodeID } from '@/domain/library/oss-api';

import { TextArea, TextInput } from '@/components/input';
import { type CreateFieldProps } from '@/utils/forms';
import { placeholderMsg } from '@/utils/labels';

import { SelectParent } from '../../components/select-parent';

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
    <div className='cc-fade-in cc-column pt-4'>
      <TitleField>
        {field => (
          <TextInput
            id='operation_title'
            aria-label='Название нового блока'
            placeholder='Название нового блока'
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
            placeholder={placeholderMsg.itemDescription}
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
