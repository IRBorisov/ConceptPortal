'use client';

import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';

import { TextArea, TextInput } from '@/components/Input';
import { PARAMETER } from '@/utils/constants';

import { CstType, type ICstCreateDTO } from '../../backend/types';
import { RSInput } from '../../components/RSInput';
import { SelectCstType } from '../../components/SelectCstType';
import { type IRSForm } from '../../models/rsform';
import { generateAlias, isBaseSet, isBasicConcept, isFunctional } from '../../models/rsformAPI';

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
    setValue('alias', generateAlias(target, schema));
    setForceComment(false);
  }

  return (
    <>
      <div className='flex items-center self-center gap-3'>
        <SelectCstType id='dlg_cst_type' className='w-[16rem]' value={cst_type} onChange={handleTypeChange} />
        <TextInput
          id='dlg_cst_alias'
          dense
          label='Имя'
          className='w-[7rem]'
          {...register('alias')}
          error={errors.alias}
        />
        <BadgeHelp
          topic={HelpTopic.CC_CONSTITUENTA}
          offset={16}
          className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
        />
      </div>

      <TextArea
        id='dlg_cst_term'
        fitContent
        spellCheck
        label='Термин'
        placeholder='Обозначение для текстовых определений'
        className='max-h-[3.6rem]'
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
              className='max-h-[3.6rem]'
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
          className='self-start cc-label text-sec-600 hover:underline'
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
          className='max-h-[5.4rem]'
          {...register('convention')}
        />
      )}
    </>
  );
}
