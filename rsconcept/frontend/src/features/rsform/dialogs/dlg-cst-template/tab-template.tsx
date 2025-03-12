'use client';

import { useTemplatesSuspense } from '@/features/library/backend/use-templates';

import { SelectSingle, TextArea } from '@/components/input1';

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

  if (!templateID) {
    onChangeTemplateID(templates[0].id);
    return null;
  }

  const filteredData = !templateSchema
    ? []
    : !filterCategory
    ? templateSchema.items
    : applyFilterCategory(filterCategory, templateSchema);

  const prototypeInfo = !prototype
    ? ''
    : `${prototype?.term_raw}${prototype?.definition_raw ? ` — ${prototype?.definition_raw}` : ''}`;

  const templateSelector = templates.map(template => ({
    value: template.id,
    label: template.title
  }));

  const categorySelector: { value: number; label: string }[] = !templateSchema
    ? []
    : templateSchema.items
        .filter(cst => cst.cst_type === CATEGORY_CST_TYPE)
        .map(cst => ({
          value: cst.id,
          label: cst.term_raw
        }));

  return (
    <div className='cc-fade-in'>
      <div className='flex border-t border-x rounded-t-md clr-input'>
        <SelectSingle
          noBorder
          placeholder='Источник'
          className='w-48'
          options={templateSelector}
          value={templateID ? { value: templateID, label: templates.find(item => item.id == templateID)!.title } : null}
          onChange={data => onChangeTemplateID(data ? data.value : null)}
        />
        <SelectSingle
          noBorder
          isSearchable={false}
          placeholder='Выберите категорию'
          className='grow ml-1 border-none'
          options={categorySelector}
          value={
            filterCategory && templateSchema
              ? {
                  value: filterCategory.id,
                  label: filterCategory.term_raw
                }
              : null
          }
          onChange={data => onChangeFilterCategory(data ? templateSchema?.cstByID.get(data?.value) ?? null : null)}
          isClearable
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
