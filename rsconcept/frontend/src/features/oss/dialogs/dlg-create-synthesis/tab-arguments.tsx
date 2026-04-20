'use client';

import { type ReactNode } from 'react';

import { type OperationSchema } from '@/domain/library';

import { Label, TextArea, TextInput } from '@/components/input';
import { type CreateFieldProps } from '@/utils/forms';
import { placeholderMsg } from '@/utils/labels';

import { PickMultiOperation } from '../../components/pick-multi-operation';
import { SelectParent } from '../../components/select-parent';

export interface DlgCreateSynthesisArgumentFields {
  TitleField: (props: CreateFieldProps<string>) => ReactNode;
  AliasField: (props: CreateFieldProps<string>) => ReactNode;
  ParentField: (props: CreateFieldProps<number | null>) => ReactNode;
  DescriptionField: (props: CreateFieldProps<string>) => ReactNode;
  ArgumentsField: (props: CreateFieldProps<number[]>) => ReactNode;
}

interface TabArgumentsProps {
  oss: OperationSchema;
  inputs: number[];
  fields: DlgCreateSynthesisArgumentFields;
}

export function TabArguments({ oss, inputs, fields }: TabArgumentsProps) {
  const replicas = oss.replicas
    .filter(item => inputs.includes(item.original))
    .map(item => item.replica)
    .concat(oss.replicas.filter(item => inputs.includes(item.replica)).map(item => item.original));
  const filtered = oss.operations.filter(item => !replicas.includes(item.id));
  const { TitleField, AliasField, ParentField, DescriptionField, ArgumentsField } = fields;

  return (
    <div className='cc-fade-in cc-column pt-4'>
      <TitleField>
        {field => (
          <TextInput
            id='operation_title'
            aria-label='Название новой схемы'
            placeholder='Название новой схемы'
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </TitleField>
      <div className='flex gap-6'>
        <div className='grid gap-1'>
          <AliasField>
            {field => (
              <TextInput
                id='operation_alias'
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
                value={field.state.value ? (oss.blockByID.get(field.state.value) ?? null) : null}
                placeholder='Родительский блок'
                onChange={value => field.handleChange(value ? value.id : null)}
              />
            )}
          </ParentField>
        </div>
        <DescriptionField>
          {field => (
            <TextArea
              id='operation_comment'
              label='Описание'
              placeholder={placeholderMsg.itemDescription}
              className='w-full'
              noResize
              rows={3}
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </DescriptionField>
      </div>

      <div className='cc-column'>
        <Label text={`Выбор аргументов: [ ${inputs.length} ]`} />
        <ArgumentsField>
          {field => (
            <PickMultiOperation
              items={filtered}
              value={field.state.value ?? []}
              onChange={field.handleChange}
              rows={6}
            />
          )}
        </ArgumentsField>
      </div>
    </div>
  );
}
