'use client';

import { type ReactNode } from 'react';

import { type OperationSchema } from '@/domain/library';
import { formatZodErrorMessage, useTx } from '@/i18n';

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
            aria-label={tx('ui.oss.operationTitle')}
            placeholder={tx('ui.oss.operationTitle')}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
          />
        )}
      </TitleField>

      <AliasField>
        {field => (
          <TextInput
            id='operation_alias'
            dense
            label={tx('semantic.term.alias')}
            placeholder={tx('ui.oss.enterAlias')}
            className='w-full'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
          />
        )}
      </AliasField>
      <ParentField>
        {field => (
          <SelectParent
            items={oss.blocks}
            value={field.state.value ? (oss.blockByID.get(field.state.value) ?? null) : null}
            placeholder={tx('semantic.term.block.parent')}
            onChange={value => field.handleChange(value ? value.id : null)}
          />
        )}
      </ParentField>

      <DescriptionField>
        {field => (
          <TextArea
            id='operation_comment'
            label={tx('semantic.term.description')}
            placeholder={tx('labels.placeholder.itemDescription')}
            noResize
            rows={5}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={formatZodErrorMessage(field.state.meta.errors[0]?.message)}
          />
        )}
      </DescriptionField>
    </div>
  );
}
