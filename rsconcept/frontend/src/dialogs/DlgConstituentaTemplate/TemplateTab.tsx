import { Dispatch, useEffect, useMemo, useState } from 'react';

import SelectSingle from '../../components/Common/SelectSingle';
import TextArea from '../../components/Common/TextArea';
import RSInput from '../../components/RSInput';
import ConstituentaPicker from '../../components/Shared/ConstituentaPicker';
import { useLibrary } from '../../context/LibraryContext';
import { CATEGORY_CST_TYPE, IConstituenta, IRSForm } from '../../models/rsform';
import { applyFilterCategory } from '../../models/rsformAPI';
import { prefixes } from '../../utils/constants';
export interface ITemplateState {
  templateID?: number
  prototype?: IConstituenta
  filterCategory?: IConstituenta
}

interface TemplateTabProps {
  state: ITemplateState
  partialUpdate: Dispatch<Partial<ITemplateState>>
}

function TemplateTab({ state, partialUpdate }: TemplateTabProps) { 
  const { templates, retrieveTemplate } = useLibrary();
  const [ selectedSchema, setSelectedSchema ] = useState<IRSForm | undefined>(undefined);
  
  const [filteredData, setFilteredData] = useState<IConstituenta[]>([]);

  const prototypeInfo = useMemo(
  () => {
    if (!state.prototype) {
      return '';
    } else {
      return `${state.prototype?.term_raw}${state.prototype?.definition_raw ? ` — ${state.prototype?.definition_raw}` : ''}`;
    }
  }, [state.prototype]);

  const templateSelector = useMemo(
  () => templates.map(
    (template) => ({
      value: template.id,
      label: template.title
    })
  ), [templates]);

  const categorySelector = useMemo(
  (): {value: number, label: string}[] => {
    if (!selectedSchema) {
      return [];
    }
    return selectedSchema.items
    .filter(cst => cst.cst_type === CATEGORY_CST_TYPE)
    .map(cst => ({
      value: cst.id,
      label: cst.term_raw
    }));
  }, [selectedSchema]);

  useEffect(
  () => {
    if (templates.length > 0 && !state.templateID) {
      partialUpdate({ templateID: templates[0].id });
    }
  }, [templates, state.templateID, partialUpdate]);

  useEffect(
  () => {
    if (!state.templateID) {
      setSelectedSchema(undefined);
    } else {
      retrieveTemplate(state.templateID, setSelectedSchema);
    }
  }, [state.templateID, retrieveTemplate]);

  // Filter constituents
  useEffect(
  () => {
    if (!selectedSchema) {
      return;
    }
    let data = selectedSchema.items;
    if (state.filterCategory) {
      data = applyFilterCategory(state.filterCategory, selectedSchema);
    }
    setFilteredData(data);
  }, [state.filterCategory, selectedSchema]);

  return (
  <div className='flex flex-col gap-3'>
    <div className='flex justify-between gap-3'>
      <SelectSingle
        className='w-full'
        options={categorySelector}
        placeholder='Выберите категорию'
        value={state.filterCategory && selectedSchema ? {
          value: state.filterCategory.id,
          label: state.filterCategory.term_raw
        } : null}
        onChange={data => partialUpdate({filterCategory: selectedSchema?.items.find(cst => cst.id === data?.value) })}
        isClearable
      />
      <SelectSingle
        className='min-w-[15rem]'
        options={templateSelector}
        placeholder='Выберите источник'
        value={state.templateID ? { value: state.templateID, label: templates.find(item => item.id == state.templateID)!.title }: null}
        onChange={data => partialUpdate({templateID: (data ? data.value : undefined)})}
      />
    </div>
    <ConstituentaPicker
      value={state.prototype}
      data={filteredData}
      onSelectValue={cst => partialUpdate( { prototype: cst } )}
      prefixID={prefixes.cst_template_ist}
      rows={9}
    />
    <TextArea id='term'
      rows={1}
      disabled
      placeholder='Шаблон конституенты не выбран'
      value={prototypeInfo}
      spellCheck
    />
    <RSInput id='expression'
      height='5.1rem'
      placeholder='Выберите шаблон из списка'
      disabled
      value={state.prototype?.definition_formal}
    />
  </div>);
}

export default TemplateTab;