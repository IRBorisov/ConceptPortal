'use client';

import { Dispatch, useEffect, useState } from 'react';

import { useTemplatesSuspense } from '@/features/library';

import { SelectSingle, TextArea } from '@/components/Input';

import { PickConstituenta } from '../../components/PickConstituenta';
import RSInput from '../../components/RSInput';
import { CATEGORY_CST_TYPE, IConstituenta, IRSForm } from '../../models/rsform';
import { applyFilterCategory } from '../../models/rsformAPI';

export interface ITemplateState {
  templateID?: number;
  prototype?: IConstituenta;
  filterCategory?: IConstituenta;
}

interface TabTemplateProps {
  state: ITemplateState;
  partialUpdate: Dispatch<Partial<ITemplateState>>;
  templateSchema?: IRSForm;
}

function TabTemplate({ state, partialUpdate, templateSchema }: TabTemplateProps) {
  const { templates } = useTemplatesSuspense();

  const [filteredData, setFilteredData] = useState<IConstituenta[]>([]);

  const prototypeInfo = !state.prototype
    ? ''
    : `${state.prototype?.term_raw}${state.prototype?.definition_raw ? ` — ${state.prototype?.definition_raw}` : ''}`;

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

  useEffect(() => {
    if (templates.length > 0 && !state.templateID) {
      partialUpdate({ templateID: templates[0].id });
    }
  }, [templates, state.templateID, partialUpdate]);

  useEffect(() => {
    if (!templateSchema) {
      return;
    }
    let data = templateSchema.items;
    if (state.filterCategory) {
      data = applyFilterCategory(state.filterCategory, templateSchema);
    }
    setFilteredData(data);
  }, [state.filterCategory, templateSchema]);

  return (
    <div className='cc-fade-in'>
      <div className='flex border-t border-x rounded-t-md clr-input'>
        <SelectSingle
          noBorder
          placeholder='Источник'
          className='w-[12rem]'
          options={templateSelector}
          value={
            state.templateID
              ? { value: state.templateID, label: templates.find(item => item.id == state.templateID)!.title }
              : null
          }
          onChange={data => partialUpdate({ templateID: data ? data.value : undefined })}
        />
        <SelectSingle
          noBorder
          isSearchable={false}
          placeholder='Выберите категорию'
          className='flex-grow ml-1 border-none'
          options={categorySelector}
          value={
            state.filterCategory && templateSchema
              ? {
                  value: state.filterCategory.id,
                  label: state.filterCategory.term_raw
                }
              : null
          }
          onChange={data =>
            partialUpdate({ filterCategory: data ? templateSchema?.cstByID.get(data?.value) : undefined })
          }
          isClearable
        />
      </div>
      <PickConstituenta
        id='dlg_template_picker'
        value={state.prototype}
        items={filteredData}
        onChange={cst => partialUpdate({ prototype: cst })}
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
        value={state.prototype?.definition_formal}
      />
    </div>
  );
}

export default TabTemplate;
