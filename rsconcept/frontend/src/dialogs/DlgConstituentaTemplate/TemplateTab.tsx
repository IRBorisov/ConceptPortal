'use client';

import { Dispatch, useEffect, useMemo, useState } from 'react';

import RSInput from '@/components/RSInput';
import PickConstituenta from '@/components/select/PickConstituenta';
import SelectSingle from '@/components/ui/SelectSingle';
import TextArea from '@/components/ui/TextArea';
import AnimateFade from '@/components/wrap/AnimateFade';
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
  const [templateSchema, setTemplateSchema] = useState<IRSForm | undefined>(undefined);

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
    if (!templateSchema) {
      return [];
    }
    return templateSchema.items
      .filter(cst => cst.cst_type === CATEGORY_CST_TYPE)
      .map(cst => ({
        value: cst.id,
        label: cst.term_raw
      }));
  }, [templateSchema]);

  useEffect(() => {
    if (templates.length > 0 && !state.templateID) {
      partialUpdate({ templateID: templates[0].id });
    }
  }, [templates, state.templateID, partialUpdate]);

  useEffect(() => {
    if (!state.templateID) {
      setTemplateSchema(undefined);
    } else {
      retrieveTemplate(state.templateID, setTemplateSchema);
    }
  }, [state.templateID, retrieveTemplate]);

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
    <AnimateFade>
      <div className='flex border-t divide-x border-x rounded-t-md'>
        <SelectSingle
          noBorder
          placeholder='Выберите категорию'
          className='flex-grow border-none'
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
      </div>
      <PickConstituenta
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
    </AnimateFade>
  );
}

export default TemplateTab;
