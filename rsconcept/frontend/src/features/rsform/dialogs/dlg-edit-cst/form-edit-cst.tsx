import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { labelType } from '@/features/rslang/labels';

import { MiniButton } from '@/components/control';
import { Label, TextArea, TextInput } from '@/components/input';

import { type IUpdateConstituentaDTO } from '../../backend/types';
import { useClearAttributions } from '../../backend/use-clear-attributions';
import { useCreateAttribution } from '../../backend/use-create-attribution';
import { useDeleteAttribution } from '../../backend/use-delete-attribution';
import { IconCrucialValue } from '../../components/icon-crucial-value';
import { RSInput } from '../../components/rs-input';
import { SelectCstType } from '../../components/select-cst-type';
import { SelectMultiConstituenta } from '../../components/select-multi-constituenta';
import { getRSDefinitionPlaceholder, labelRSExpression } from '../../labels';
import { CstType, type IConstituenta, type IRSForm } from '../../models/rsform';
import { generateAlias, isBaseSet, isBasicConcept } from '../../models/rsform-api';

interface FormEditCstProps {
  schema: IRSForm;
  target: IConstituenta;
}

export function FormEditCst({ target, schema }: FormEditCstProps) {
  const { createAttribution } = useCreateAttribution();
  const { deleteAttribution } = useDeleteAttribution();
  const { clearAttributions } = useClearAttributions();

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
  const isBasic = isBasicConcept(cst_type) || cst_type === CstType.NOMINAL;
  const isElementary = isBaseSet(cst_type);
  const showConvention = !!convention || forceComment || isBasic;
  const attributions = target.attributes.map(id => schema.cstByID.get(id)!);

  function handleTypeChange(newValue: CstType) {
    setValue('item_data.cst_type', newValue);
    setValue('item_data.alias', generateAlias(newValue, schema), { shouldValidate: true });
    setForceComment(false);
  }

  function handleToggleCrucial() {
    setValue('item_data.crucial', !crucial);
  }

  function handleAddAttribution(item: IConstituenta) {
    void createAttribution({
      itemID: schema.id,
      data: {
        container: target.id,
        attribute: item.id
      }
    });
  }

  function handleRemoveAttribution(item: IConstituenta) {
    void deleteAttribution({
      itemID: schema.id,
      data: {
        container: target.id,
        attribute: item.id
      }
    });
  }

  function handleClearAttributions() {
    void clearAttributions({
      itemID: schema.id,
      data: {
        target: target.id
      }
    });
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
        <BadgeHelp topic={HelpTopic.CC_CONSTITUENTA} offset={16} contentClass='sm:max-w-160' />
      </div>

      <TextArea
        id='dlg_cst_term'
        fitContent
        spellCheck
        label='Термин'
        className='max-h-15 disabled:min-h-9'
        placeholder='Обозначение для текстовых определений'
        {...register('item_data.term_raw')}
        error={errors.item_data?.term_raw}
      />

      {target.cst_type === CstType.NOMINAL || target.attributes.length > 0 ? (
        <div className='flex flex-col gap-1'>
          <Label text='Атрибутирующие конституенты' />
          <SelectMultiConstituenta
            items={schema.items.filter(item => item.id !== target.id)}
            value={attributions}
            onAdd={handleAddAttribution}
            onClear={handleClearAttributions}
            onRemove={handleRemoveAttribution}
            placeholder={'Выберите конституенты'}
          />
        </div>
      ) : null}

      {cst_type !== CstType.NOMINAL ? (
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
          value={labelType(target.analysis.type)}
          className='cursor-default'
        />
      ) : null}

      <Controller
        control={control}
        name='item_data.definition_formal'
        render={({ field }) =>
          !!field.value || (!isElementary && !target.is_inherited) ? (
            <RSInput
              id='dlg_cst_expression'
              noTooltip
              label={labelRSExpression(cst_type)}
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
              placeholder='Текстовая интерпретация формального выражения'
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
          placeholder={isBasic ? 'Договоренность об интерпретации' : 'Пояснение разработчика'}
          className='max-h-20 disabled:min-h-9'
          {...register('item_data.convention')}
          error={errors.item_data?.convention}
          disabled={isBasic && target.is_inherited}
        />
      )}
    </>
  );
}
