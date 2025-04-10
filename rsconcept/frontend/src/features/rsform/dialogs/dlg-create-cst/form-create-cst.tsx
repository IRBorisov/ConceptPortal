'use client';

import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';

import { TextArea, TextInput } from '@/components/input';

import { CstType, type ICstCreateDTO } from '../../backend/types';
import { RSInput } from '../../components/rs-input';
import { SelectCstType } from '../../components/select-cst-type';
import { type IRSForm } from '../../models/rsform';
import { generateAlias, isBaseSet, isBasicConcept, isFunctional } from '../../models/rsform-api';

interface FormCreateCstProps {
  schema: IRSForm;
}

export function FormCreateCst({ schema }: FormCreateCstProps) {
  const {
    setValue,
    register,
    control,
    formState: { errors }
  } = useFormContext<ICstCreateDTO>();
  const [forceComment, setForceComment] = useState(false);

  const cst_type = useWatch({ control, name: 'cst_type' });
  const convention = useWatch({ control, name: 'convention' });
  const isBasic = isBasicConcept(cst_type);
  const isElementary = isBaseSet(cst_type);
  const isFunction = isFunctional(cst_type);
  const showConvention = !!convention || forceComment || isBasic;

  function handleTypeChange(target: CstType) {
    setValue('cst_type', target);
    setValue('alias', generateAlias(target, schema), { shouldValidate: true });
    setForceComment(false);
  }

  return (
    <>
      <div className='flex items-center self-center gap-3'>
        <SelectCstType
          id='dlg_cst_type' //
          value={cst_type}
          onChange={handleTypeChange}
        />
        <TextInput
          id='dlg_cst_alias' //
          dense
          label='Имя'
          className='w-28'
          {...register('alias')}
          error={errors.alias}
        />
        <BadgeHelp topic={HelpTopic.CC_CONSTITUENTA} offset={16} contentClass='sm:max-w-160' />
      </div>

      <TextArea
        id='dlg_cst_term'
        fitContent
        spellCheck
        label='Термин'
        placeholder='Обозначение для текстовых определений'
        className='max-h-15'
        {...register('term_raw')}
        error={errors.term_raw}
      />

      <Controller
        control={control}
        name='definition_formal'
        render={({ field }) =>
          !!field.value || !isElementary ? (
            <RSInput
              id='dlg_cst_expression'
              noTooltip
              label={
                cst_type === CstType.STRUCTURED
                  ? 'Область определения'
                  : isFunction
                  ? 'Определение функции'
                  : 'Формальное определение'
              }
              placeholder={
                cst_type !== CstType.STRUCTURED ? 'Родоструктурное выражение' : 'Типизация родовой структуры'
              }
              value={field.value}
              onChange={field.onChange}
              schema={schema}
            />
          ) : (
            <></>
          )
        }
      />

      <Controller
        control={control}
        name='definition_raw'
        render={({ field }) =>
          !!field.value || !isElementary ? (
            <TextArea
              id='dlg_cst_definition'
              spellCheck
              fitContent
              label='Текстовое определение'
              placeholder='Текстовая интерпретация формального выражения'
              className='max-h-15'
              value={field.value}
              onChange={field.onChange}
            />
          ) : (
            <></>
          )
        }
      />

      {!showConvention ? (
        <button
          id='dlg_cst_show_comment'
          tabIndex={-1}
          type='button'
          className='self-start cc-label text-sec-600 hover:underline select-none'
          onClick={() => setForceComment(true)}
        >
          Добавить комментарий
        </button>
      ) : (
        <TextArea
          id='dlg_cst_convention'
          spellCheck
          fitContent
          label={isBasic ? 'Конвенция' : 'Комментарий'}
          placeholder={isBasic ? 'Договоренность об интерпретации' : 'Пояснение разработчика'}
          className='max-h-20'
          {...register('convention')}
        />
      )}
    </>
  );
}
