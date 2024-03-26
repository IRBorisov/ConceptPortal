'use client';

import { Dispatch, useEffect, useMemo, useState } from 'react';

import RSInput from '@/components/RSInput';
import ConstituentaPicker from '@/components/select/ConstituentaPicker';
import SelectSingle from '@/components/ui/SelectSingle';
import TextArea from '@/components/ui/TextArea';
import { useLibrary } from '@/context/LibraryContext';
import { CATEGORY_CST_TYPE, IConstituenta, IRSForm } from '@/models/rsform';
import { applyFilterCategory } from '@/models/rsformAPI';
import { prefixes } from '@/utils/constants';
export interface ITemplateState {
  templateID?: number;
  prototype?: IConstituenta;
  filterCategory?: IConstituenta;
}

interface TemplateTabProps {
  state: ITemplateState;
  partialUpdate: Dispatch<Partial<ITemplateState>>;
}

function TemplateTab({ state, partialUpdate }: TemplateTabProps) {
  const { templates, retrieveTemplate } = useLibrary();
  const [category, setCategory] = useState<IRSForm | undefined>(undefined);

  const [filteredData, setFilteredData] = useState<IConstituenta[]>([]);

  const prototypeInfo = useMemo(() => {
    if (!state.prototype) {
      return '';
    } else {
      return `${state.prototype?.term_raw}${
        state.prototype?.definition_raw ? ` — ${state.prototype?.definition_raw}` : ''
      }`;
    }
  }, [state.prototype]);

  const templateSelector = useMemo(
    () =>
      templates.map(template => ({
        value: template.id,
        label: template.title
      })),
    [templates]
  );

  const categorySelector = useMemo((): { value: number; label: string }[] => {
    if (!category) {
      return [];
    }
    return category.items
      .filter(cst => cst.cst_type === CATEGORY_CST_TYPE)
      .map(cst => ({
        value: cst.id,
        label: cst.term_raw
      }));
  }, [category]);

  useEffect(() => {
    if (templates.length > 0 && !state.templateID) {
      partialUpdate({ templateID: templates[0].id });
    }
  }, [templates, state.templateID, partialUpdate]);

  useEffect(() => {
    if (!state.templateID) {
      setCategory(undefined);
    } else {
      retrieveTemplate(state.templateID, setCategory);
    }
  }, [state.templateID, retrieveTemplate]);

  useEffect(() => {
    if (!category) {
      return;
    }
    let data = category.items;
    if (state.filterCategory) {
      data = applyFilterCategory(state.filterCategory, category);
    }
    setFilteredData(data);
  }, [state.filterCategory, category]);

  return (
    <>
      <div className='flex'>
        <SelectSingle
          placeholder='Выберите категорию'
          className='flex-grow border-none'
          options={categorySelector}
          value={
            state.filterCategory && category
              ? {
                  value: state.filterCategory.id,
                  label: state.filterCategory.term_raw
                }
              : null
          }
          onChange={data => partialUpdate({ filterCategory: category?.items.find(cst => cst.id === data?.value) })}
          isClearable
        />
        <SelectSingle
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
      </div>
      <ConstituentaPicker
        id='dlg_template_picker'
        value={state.prototype}
        data={filteredData}
        onSelectValue={cst => partialUpdate({ prototype: cst })}
        prefixID={prefixes.cst_template_ist}
        rows={9}
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
    </>
  );
}

export default TemplateTab;
