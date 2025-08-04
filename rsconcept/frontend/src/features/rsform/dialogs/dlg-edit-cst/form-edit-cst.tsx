import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { MiniButton } from '@/components/control';
import { TextArea, TextInput } from '@/components/input';

import { CstType, type IUpdateConstituentaDTO } from '../../backend/types';
import { IconCrucialValue } from '../../components/icon-crucial-value';
import { RSInput } from '../../components/rs-input';
import { SelectCstType } from '../../components/select-cst-type';
import { getRSDefinitionPlaceholder, labelCstTypification } from '../../labels';
import { type IConstituenta, type IRSForm } from '../../models/rsform';
import { generateAlias, isBaseSet, isBasicConcept, isFunctional } from '../../models/rsform-api';

interface FormEditCstProps {
  schema: IRSForm;
  target: IConstituenta;
}

export function FormEditCst({ target, schema }: FormEditCstProps) {
  const {
    setValue,
    control,
    register,
    formState: { errors }
  } = useFormContext<IUpdateConstituentaDTO>();

  const [forceComment, setForceComment] = useState(false);

  const cst_type = useWatch({ control, name: 'item_data.cst_type' }) ?? CstType.BASE;
  const convention = useWatch({ control, name: 'item_data.convention' });
  const crucial = useWatch({ control, name: 'item_data.crucial' }) ?? false;
  const isBasic = isBasicConcept(cst_type);
  const isElementary = isBaseSet(cst_type);
  const isFunction = isFunctional(cst_type);
  const showConvention = !!convention || forceComment || isBasic;

  function handleTypeChange(newValue: CstType) {
    setValue('item_data.cst_type', newValue);
    setValue('item_data.alias', generateAlias(newValue, schema), { shouldValidate: true });
    setForceComment(false);
  }

  function handleToggleCrucial() {
    setValue('item_data.crucial', !crucial);
  }

  return (
    <>
      <div className='flex items-center self-center gap-3'>
        <MiniButton
          title='Ключевая конституента'
          icon={<IconCrucialValue size='1.25rem' value={crucial} />}
          onClick={handleToggleCrucial}
        />
        <SelectCstType
          id='dlg_cst_type' //
          value={cst_type}
          onChange={handleTypeChange}
          disabled={target.is_inherited}
        />
        <TextInput
          id='dlg_cst_alias'
          dense
          label='Имя'
          className='w-28'
          {...register('item_data.alias')}
          error={errors.item_data?.alias}
        />
      </div>

      <TextArea
        id='dlg_cst_term'
        fitContent
        spellCheck
        label='Термин'
        className='max-h-15'
        {...register('item_data.term_raw')}
        error={errors.item_data?.term_raw}
      />

      <TextArea
        id='cst_typification'
        fitContent
        dense
        noResize
        noBorder
        noOutline
        transparent
        readOnly
        label='Типизация'
        value={labelCstTypification(target)}
        className='cursor-default'
      />

      <Controller
        control={control}
        name='item_data.definition_formal'
        render={({ field }) =>
          !!field.value || (!isElementary && !target.is_inherited) ? (
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
              placeholder={getRSDefinitionPlaceholder(cst_type)}
              className='max-h-15'
              schema={schema}
              value={field.value}
              onChange={field.onChange}
              disabled={target.is_inherited}
            />
          ) : (
            <></>
          )
        }
      />

      <Controller
        control={control}
        name='item_data.definition_raw'
        render={({ field }) =>
          !!field.value || !isElementary ? (
            <TextArea
              id='dlg_edit_cst_definition_raw'
              fitContent
              spellCheck
              label='Текстовое определение'
              className='max-h-15'
              value={field.value}
              onChange={field.onChange}
              error={errors.item_data?.definition_raw}
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
          className='self-start cc-label text-primary hover:underline select-none'
          onClick={() => setForceComment(true)}
        >
          Добавить комментарий
        </button>
      ) : (
        <TextArea
          id='dlg_edit_cst_convention'
          fitContent
          spellCheck
          label={isBasic ? 'Конвенция' : 'Комментарий'}
          className='max-h-20'
          {...register('item_data.convention')}
          error={errors.item_data?.convention}
          disabled={isBasic && target.is_inherited}
        />
      )}
    </>
  );
}
