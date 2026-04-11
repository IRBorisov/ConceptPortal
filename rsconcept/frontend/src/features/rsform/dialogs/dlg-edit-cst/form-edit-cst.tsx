import { type ReactNode, useState } from 'react';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { labelType } from '@/features/rslang/labels';

import { MiniButton } from '@/components/control';
import { Label, TextArea, TextInput } from '@/components/input';
import { type CreateFieldProps } from '@/utils/forms';

import { type UpdateConstituentaDTO } from '../../backend/types';
import { IconCrucialValue } from '../../components/icon-crucial-value';
import { RefsInput } from '../../components/refs-input';
import { RSInput } from '../../components/rs-input';
import { SelectCstType } from '../../components/select-cst-type';
import { SelectMultiConstituenta } from '../../components/select-multi-constituenta';
import { getRSDefinitionPlaceholder, labelRSExpression } from '../../labels';
import { type Constituenta, CstType, type RSForm } from '../../models/rsform';
import { isBaseSet, isBasicConcept } from '../../models/rsform-api';

interface FormEditCstProps {
  schema: RSForm;
  target: Constituenta;
  itemData: UpdateConstituentaDTO['item_data'];
  onChangeCstType: (newValue: CstType) => void;
  onToggleCrucial: () => void;
  onAddAttribution: (item: Constituenta) => void;
  onRemoveAttribution: (item: Constituenta) => void;
  onClearAttributions: () => void;
  fields: FormEditCstFields;
}

export interface FormEditCstFields {
  AliasField: (props: CreateFieldProps<string>) => ReactNode;
  TermRawField: (props: CreateFieldProps<string>) => ReactNode;
  DefinitionFormalField: (props: CreateFieldProps<string>) => ReactNode;
  DefinitionRawField: (props: CreateFieldProps<string>) => ReactNode;
  ConventionField: (props: CreateFieldProps<string>) => ReactNode;
}

export function FormEditCst({
  target,
  schema,
  itemData,
  onChangeCstType,
  onToggleCrucial,
  onAddAttribution,
  onRemoveAttribution,
  onClearAttributions,
  fields
}: FormEditCstProps) {
  const [forceComment, setForceComment] = useState(false);
  const { AliasField, TermRawField, DefinitionFormalField, DefinitionRawField, ConventionField } = fields;
  const cst_type = itemData.cst_type ?? CstType.BASE;
  const convention = itemData.convention;
  const crucial = itemData.crucial ?? false;
  const isBasic = isBasicConcept(cst_type) || cst_type === CstType.NOMINAL;
  const isElementary = isBaseSet(cst_type);
  const showConvention = !!convention || forceComment || isBasic;
  const attributions = target.attributes.map(id => schema.cstByID.get(id)!);

  function handleTypeChange(newValue: CstType) {
    onChangeCstType(newValue);
    setForceComment(false);
  }

  return (
    <>
      <div className='flex items-center self-center gap-3'>
        <MiniButton
          title='Ключевая конституента'
          icon={<IconCrucialValue size='1.25rem' value={crucial} />}
          onClick={onToggleCrucial}
        />
        <SelectCstType id='dlg_cst_type' value={cst_type} onChange={handleTypeChange} disabled={target.is_inherited} />
        <AliasField>
          {field => (
            <TextInput
              id='dlg_cst_alias'
              dense
              label='Имя'
              className='w-28'
              value={field.state.value ?? ''}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </AliasField>
        <BadgeHelp topic={HelpTopic.CC_CONSTITUENTA} offset={16} contentClass='sm:max-w-160' />
      </div>

      <TermRawField>
        {field => (
          <RefsInput
            id='dlg_cst_term'
            label='Термин'
            maxHeight='3.75rem'
            className='disabled:min-h-9'
            placeholder='Обозначение для текстовых определений'
            schema={schema}
            value={field.state.value ?? ''}
            initialValue={target.term_raw}
            resolved={target.term_raw === field.state.value ? target.term_resolved : (field.state.value ?? '')}
            onChange={newValue => field.handleChange(newValue)}
          />
        )}
      </TermRawField>
      {target.cst_type === CstType.NOMINAL || target.attributes.length > 0 ? (
        <div className='flex flex-col gap-1'>
          <Label text='Атрибутирующие конституенты' />
          <SelectMultiConstituenta
            items={schema.items.filter(item => item.id !== target.id)}
            value={attributions}
            onAdd={onAddAttribution}
            onClear={onClearAttributions}
            onRemove={onRemoveAttribution}
            placeholder={'Выберите конституенты'}
          />
        </div>
      ) : null}

      {cst_type !== CstType.NOMINAL ? (
        <TextArea
          id='dlg_cst_typification'
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

      <DefinitionFormalField>
        {field =>
          !!field.state.value || (!isElementary && !target.is_inherited) ? (
            <RSInput
              id='dlg_cst_expression'
              portalHoverTooltips
              label={labelRSExpression(cst_type)}
              placeholder={getRSDefinitionPlaceholder(cst_type)}
              maxHeight='3.75rem'
              schema={schema}
              value={field.state.value ?? ''}
              onChange={field.handleChange}
              disabled={target.is_inherited}
            />
          ) : (
            <></>
          )
        }
      </DefinitionFormalField>

      <DefinitionRawField>
        {field =>
          !!field.state.value || !isElementary ? (
            <RefsInput
              id='dlg_edit_cst_definition_raw'
              schema={schema}
              label='Текстовое определение'
              placeholder='Текстовая интерпретация формального выражения'
              maxHeight='3.75rem'
              value={field.state.value ?? ''}
              initialValue={target.definition_raw}
              resolved={
                target.definition_raw === field.state.value ? target.definition_resolved : (field.state.value ?? '')
              }
              onChange={field.handleChange}
            />
          ) : (
            <></>
          )
        }
      </DefinitionRawField>

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
        <ConventionField>
          {field => (
            <TextArea
              id='dlg_edit_cst_convention'
              fitContent
              spellCheck
              label={isBasic ? 'Конвенция' : 'Комментарий'}
              placeholder={isBasic ? 'Договоренность об интерпретации базового понятия' : 'Пояснение разработчика'}
              areaClassName='max-h-20 disabled:min-h-9'
              value={field.state.value ?? ''}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
              disabled={isBasic && target.is_inherited}
            />
          )}
        </ConventionField>
      )}
    </>
  );
}
