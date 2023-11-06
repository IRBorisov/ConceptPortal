import { useEffect, useLayoutEffect, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import ConceptTab from '../../components/Common/ConceptTab';
import ConceptTooltip from '../../components/Common/ConceptTooltip';
import Modal, { ModalProps } from '../../components/Common/Modal';
import HelpRSTemplates from '../../components/Help/HelpRSTemplates';
import { HelpIcon } from '../../components/Icons';
import usePartialUpdate from '../../hooks/usePartialUpdate';
import { CstType, ICstCreateData, IRSForm } from '../../models/rsform';
import { createAliasFor, validateCstAlias } from '../../utils/misc';
import ArgumentsTab, { IArgumentsState } from './ArgumentsTab';
import ConstituentaTab from './ConstituentaTab';
import TemplateTab, { ITemplateState } from './TemplateTab';

interface DlgConstituentaTemplateProps
extends Pick<ModalProps, 'hideWindow'> {
  schema: IRSForm
  onCreate: (data: ICstCreateData) => void
}

export enum TabID {
  TEMPLATE = 0,
  ARGUMENTS = 1,
  CONSTITUENTA = 2
}

function DlgConstituentaTemplate({ hideWindow, schema, onCreate }: DlgConstituentaTemplateProps) {
  const [validated, setValidated] = useState(false);
  const [ templateData, updateTemplateData ] = usePartialUpdate<ITemplateState>({});
  const [ argumentsData, updateArgumentsData ] = usePartialUpdate<IArgumentsState>({
    definition: '',
    arguments: []
  });
  const [cstData, updateCstData] = usePartialUpdate<ICstCreateData>({
    cst_type: CstType.TERM,
    insert_after: null,
    alias: '',
    convention: '',
    definition_formal: '',
    definition_raw: '',
    term_raw: '',
    term_forms: []
  });
  
  const [ activeTab, setActiveTab ] = useState(TabID.TEMPLATE);

  const handleSubmit = () => onCreate(cstData);
  
  useLayoutEffect(
  () => {
    updateCstData({ alias: createAliasFor(cstData.cst_type, schema) });
  }, [cstData.cst_type, updateCstData, schema]);

  useEffect(
  () => {
    setValidated(validateCstAlias(cstData.alias, cstData.cst_type, schema));
  }, [cstData.alias, cstData.cst_type, schema]);

  useLayoutEffect(
  () => {
    if (!templateData.prototype) {
      updateCstData({
        definition_raw: '',
        definition_formal: '',
        term_raw: ''
      });
      updateArgumentsData({
        definition: '',
        arguments: []
      });
    } else {
      updateCstData({
        cst_type: templateData.prototype.cst_type,
        definition_raw: templateData.prototype.definition_raw,
        definition_formal: templateData.prototype.definition_formal,
        term_raw:  templateData.prototype.term_raw
      });
      updateArgumentsData({
        definition: templateData.prototype.definition_formal,
        arguments: templateData.prototype.parse.args.map(
          arg => ({
            alias: arg.alias,
            typification: arg.typification,
            value: ''
          })
        )
      });
    }
  }, [templateData.prototype, updateCstData, updateArgumentsData]);

  return (
  <Modal
    title='Создание конституенты из шаблона'
    hideWindow={hideWindow}
    canSubmit={validated}
    onSubmit={handleSubmit}
    submitText='Создать'
  >
  <div className='max-w-[40rem] min-w-[40rem] min-h-[35rem] px-2 mb-1'>
  <Tabs
    selectedIndex={activeTab}
    onSelect={setActiveTab}
    defaultFocus
    selectedTabClassName='clr-selected'
    className='flex flex-col items-center'
  >
    <div className='flex gap-1 pl-6 mb-3'>
      <TabList className='flex items-start font-semibold text-center border select-none clr-controls small-caps'>
        <ConceptTab tooltip='Выбор шаблона выражения' className='border-r w-[8rem]'>
          Шаблон
        </ConceptTab>
        <ConceptTab tooltip='Подстановка аргументов шаблона' className='border-r w-[8rem]'>
          Аргументы
        </ConceptTab>
        <ConceptTab tooltip='Редактирование атрибутов конституенты' className='w-[8rem]'>
          Конституента
        </ConceptTab>
      </TabList>

      <div id='templates-help' className='px-1 py-1'>
        <HelpIcon color='text-primary' size={5} />
      </div>
      <ConceptTooltip
        anchorSelect='#templates-help'
        className='max-w-[30rem] z-modal-tooltip'
        offset={4}
      >
        <HelpRSTemplates />
      </ConceptTooltip>
    </div>
    
    <div className='w-full'>
      <TabPanel>
        <TemplateTab
          state={templateData}
          partialUpdate={updateTemplateData}
        />
      </TabPanel>

      <TabPanel>
        <ArgumentsTab
          schema={schema}
          state={argumentsData}
          partialUpdate={updateArgumentsData}
        />
      </TabPanel>

      <TabPanel>
        <ConstituentaTab 
          state={cstData}
          partialUpdate={updateCstData}
        />
      </TabPanel>
    </div>
  </Tabs>
  </div>
  </Modal>);
}

export default DlgConstituentaTemplate;
