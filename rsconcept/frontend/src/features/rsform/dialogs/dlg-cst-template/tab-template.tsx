'use client';

import { useTemplatesSuspense } from '@/features/library/backend/use-templates';

import { TextArea } from '@/components/input';
import { ComboBox } from '@/components/input/combo-box';

import { useRSForm } from '../../backend/use-rsform';
import { PickConstituenta } from '../../components/pick-constituenta';
import { RSInput } from '../../components/rs-input';
import { CATEGORY_CST_TYPE } from '../../models/rsform';
import { applyFilterCategory } from '../../models/rsform-api';

import { useTemplateContext } from './template-context';

export function TabTemplate() {
  const {
    templateID, //
    filterCategory,
    prototype,
    onChangePrototype,
    onChangeTemplateID,
    onChangeFilterCategory
  } = useTemplateContext();

  const { templates } = useTemplatesSuspense();
  const { schema: templateSchema } = useRSForm({ itemID: templateID ?? undefined });
  const selectedTemplate = templates.find(item => item.id === templateID);

  const filteredData = !templateSchema
    ? []
    : !filterCategory
    ? templateSchema.items
    : applyFilterCategory(filterCategory, templateSchema);

  const prototypeInfo = !prototype
    ? ''
    : `${prototype?.term_raw}${prototype?.definition_raw ? ` — ${prototype?.definition_raw}` : ''}`;

  const categorySelector = !templateSchema
    ? []
    : templateSchema.items.filter(cst => cst.cst_type === CATEGORY_CST_TYPE);

  return (
    <div className='cc-fade-in'>
      <div className='flex gap-1 border-t border-x rounded-t-md bg-input'>
        <ComboBox
          value={selectedTemplate ?? null}
          items={templates}
          noBorder
          noSearch
          placeholder='Источник'
          className='w-48'
          idFunc={item => String(item.id)}
          labelValueFunc={item => item.title}
          labelOptionFunc={item => item.title}
          onChange={item => onChangeTemplateID(item?.id ?? null)}
        />
        <ComboBox
          value={filterCategory}
          items={categorySelector}
          noBorder
          noSearch
          clearable
          placeholder='Категория'
          className='grow'
          idFunc={cst => String(cst.id)}
          labelValueFunc={cst => cst.term_raw}
          labelOptionFunc={cst => cst.term_raw}
          onChange={cst => onChangeFilterCategory(cst)}
        />
      </div>
      <PickConstituenta
        id='dlg_template_picker'
        value={prototype}
        items={filteredData}
        onChange={onChangePrototype}
        className='rounded-t-none'
        rows={8}
      />

      <TextArea
        id='dlg_template_term'
        disabled
        spellCheck
        placeholder='Шаблон конституенты не выбран'
        className='my-3'
        rows={2}
        value={prototypeInfo}
      />
      <RSInput
        id='dlg_template_expression'
        disabled
        placeholder='Выберите шаблон из списка'
        height='5.1rem'
        value={prototype?.definition_formal}
      />
    </div>
  );
}
