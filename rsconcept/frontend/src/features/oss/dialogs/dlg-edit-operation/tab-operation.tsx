import { type ReactNode } from 'react';

import { TextArea, TextInput } from '@/components/input';
import { type CreateFieldProps } from '@/utils/forms';

import { SelectParent } from '../../components/select-parent';
import { type OperationSchema } from '../../models/oss';

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
  const { TitleField, AliasField, ParentField, DescriptionField } = fields;

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

      <AliasField>
        {field => (
          <TextInput
            id='operation_alias' //
            label='Сокращение'
            placeholder='Введите сокращение'
            className='w-80'
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
            value={field.state.value ? oss.blockByID.get(field.state.value) ?? null : null}
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
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </DescriptionField>
    </div>
  );
}
