'use client';

import { type ReactNode } from 'react';

import { type OperationSchema } from '@/domain/library';
import { useTx } from '@/i18n';

import { TextArea, TextInput } from '@/components/input';
import { type CreateFieldProps } from '@/utils/forms';

import { SelectParent } from '../../components/select-parent';

export interface DlgEditOperationCardFields {
  TitleField: (props: CreateFieldProps<string>) => ReactNode;
  AliasField: (props: CreateFieldProps<string>) => ReactNode;
  ParentField: (props: CreateFieldProps<number | null>) => ReactNode;
  DescriptionField: (props: CreateFieldProps<string>) => ReactNode;
}

interface TabOperationProps {
  oss: OperationSchema;
  fields: DlgEditOperationCardFields;
}

export function TabOperation({ oss, fields }: TabOperationProps) {
  const tx = useTx();
  const { TitleField, AliasField, ParentField, DescriptionField } = fields;

  return (
    <div className='pt-3 cc-fade-in cc-column'>
      <TitleField>
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
      </TitleField>

      <AliasField>
        {field => (
          <TextInput
            id='operation_alias'
            dense
            label={tx('tx.lib.alias')}
            placeholder={tx('tx.validate.alias.empty')}
            className='w-full'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </AliasField>
      <ParentField>
        {field => (
          <SelectParent
            items={oss.blocks}
            value={field.state.value ? (oss.blockByID.get(field.state.value) ?? null) : null}
            placeholder={tx('tx.oss.block.parent')}
            onChange={value => field.handleChange(value ? value.id : null)}
          />
        )}
      </ParentField>

      <DescriptionField>
        {field => (
          <TextArea
            id='operation_comment'
            label={tx('tx.lib.description')}
            placeholder={tx('labels.placeholder.itemDescription')}
            noResize
            rows={5}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </DescriptionField>
    </div>
  );
}
