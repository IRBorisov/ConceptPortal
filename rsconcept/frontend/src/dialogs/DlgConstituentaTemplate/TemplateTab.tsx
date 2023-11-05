import { Dispatch, useEffect, useMemo, useState } from 'react';

import ConceptSearch from '../../components/Common/ConceptSearch';
import SelectSingle from '../../components/Common/SelectSingle';
import TextArea from '../../components/Common/TextArea';
import DataTable, { createColumnHelper,IConditionalStyle } from '../../components/DataTable';
import ConstituentaTooltip from '../../components/Help/ConstituentaTooltip';
import RSInput from '../../components/RSInput';
import { useLibrary } from '../../context/LibraryContext';
import { useConceptTheme } from '../../context/ThemeContext';
import { CstMatchMode } from '../../models/miscelanious';
import { applyFilterCategory, CATEGORY_CST_TYPE, IConstituenta, IRSForm, matchConstituenta } from '../../models/rsform';
import { colorfgCstStatus } from '../../utils/color';
import { prefixes } from '../../utils/constants';

export interface ITemplateState {
  templateID?: number
  prototype?: IConstituenta
  filterCategory?: IConstituenta
  filterText: string
}

interface TemplateTabProps {
  state: ITemplateState
  partialUpdate: Dispatch<Partial<ITemplateState>>
}

const constituentaHelper = createColumnHelper<IConstituenta>();

function TemplateTab({ state, partialUpdate }: TemplateTabProps) {
  const { colors } = useConceptTheme();
  
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
    if (state.filterText) {
      data = data.filter(cst => matchConstituenta(state.filterText, cst, CstMatchMode.TERM));
    }
    setFilteredData(data);
  }, [state.filterText, state.filterCategory, selectedSchema]);

  function handleSelectTemplate(cst: IConstituenta) {
    partialUpdate( { prototype: cst } );
  }

  const columns = useMemo(
  () => [
    constituentaHelper.accessor('alias', {
      id: 'alias',
      size: 65,
      minSize: 65,
      cell: props => {
        const cst = props.row.original;
        return (<>
          <div
            id={`${prefixes.cst_template_ist}${cst.alias}`}
            className='min-w-[3.1rem] max-w-[3.1rem] px-1 text-center rounded-md whitespace-nowrap'
            style={{
              borderWidth: '1px', 
              borderColor: colorfgCstStatus(cst.status, colors), 
              color: colorfgCstStatus(cst.status, colors), 
              fontWeight: 600
            }}
          >
            {cst.alias}
          </div>
          <ConstituentaTooltip data={cst} anchor={`#${prefixes.cst_template_ist}${cst.alias}`} />
        </>);
      }
    }),
    constituentaHelper.accessor('term_resolved', {
      id: 'term',
      size: 600,
      minSize: 350,
      maxSize: 600
    })
  ], [colors]);

  const conditionalRowStyles = useMemo(
  (): IConditionalStyle<IConstituenta>[] => [
    {
      when: (cst: IConstituenta) => cst.id === state.prototype?.id,
      style: {
        backgroundColor: colors.bgSelected
      },
    }
  ], [state.prototype, colors]);

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
    <div>
      <ConceptSearch 
        value={state.filterText}
        onChange={newValue => partialUpdate({ filterText: newValue} )}
        dense
      />
      <div className='border min-h-[17.5rem] max-h-[17.5rem] text-sm overflow-y-auto select-none'>
      <DataTable
        data={filteredData}
        columns={columns}
        conditionalRowStyles={conditionalRowStyles}
        
        dense
        noHeader

        noDataComponent={
          <span className='flex flex-col justify-center p-2 text-center min-h-[5rem]'>
            <p>Список конституент пуст</p>
            <p>Измените параметры фильтра</p>
          </span>
        }

        onRowClicked={handleSelectTemplate}
      />
      </div>
    </div>
    <TextArea id='term'
      rows={1}
      disabled
      placeholder='Шаблон конституенты не выбран'
      value={prototypeInfo}
      spellCheck
    />
    <RSInput id='expression'
      height='4.8rem'
      placeholder='Выберите шаблон из списка'
      disabled
      value={state.prototype?.definition_formal}
    />
  </div>);
}

export default TemplateTab;