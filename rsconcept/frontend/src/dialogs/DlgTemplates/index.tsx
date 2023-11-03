import { useEffect, useLayoutEffect, useState } from 'react';

import ConceptTooltip from '../../components/Common/ConceptTooltip';
import Modal, { ModalProps } from '../../components/Common/Modal';
import SwitchButton from '../../components/Common/SwitchButton';
import HelpRSTemplates from '../../components/Help/HelpRSTemplates';
import { HelpIcon } from '../../components/Icons';
import usePartialUpdate from '../../hooks/usePartialUpdate';
import { CstType, ICstCreateData, IRSForm } from '../../models/rsform';
import { createAliasFor, validateCstAlias } from '../../utils/misc';
import ConstituentaTab from './ConstituentaTab';
import TemplateTab, { ITemplateState } from './TemplateTab';

interface DlgTemplatesProps
extends Pick<ModalProps, 'hideWindow'> {
  schema: IRSForm
  onCreate: (data: ICstCreateData) => void
}

function DlgTemplates({ hideWindow, schema, onCreate }: DlgTemplatesProps) {
  const [validated, setValidated] = useState(false);
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
  const [ templateData, updateTemplateData ] = usePartialUpdate<ITemplateState>({
    filterText: ''
  });
  
  const [ showAttributes, setShowAttributes ] = useState(false);

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
    } else {
    updateCstData({
      cst_type: templateData.prototype.cst_type,
      definition_raw: templateData.prototype.definition_raw,
      definition_formal: templateData.prototype.definition_formal,
      term_raw:  templateData.prototype.term_raw
    });
    }
  }, [templateData.prototype, updateCstData]);

  return (
  <Modal
    title='Создание конституенты из шаблона'
    hideWindow={hideWindow}
    canSubmit={validated}
    onSubmit={handleSubmit}
    submitText='Создать'
  >
  <div className='h-fit max-w-[40rem] min-w-[40rem] min-h-[35rem] px-2 mb-2 flex flex-col justify-stretch gap-3'>
    <div className='flex items-center self-center flex-start'>
      <SwitchButton 
        label='Шаблон'
        tooltip='Выбор шаблона выражения'
        dimensions='min-w-[10rem] h-fit'
        value={false}
        isSelected={!showAttributes}
        onSelect={(value) => setShowAttributes(value)}
      />
      <SwitchButton 
        label='Конституента'
        tooltip='Редактирование атрибутов конституенты'
        dimensions='min-w-[10rem] h-fit'
        value={true}
        isSelected={showAttributes}
        onSelect={(value) => setShowAttributes(value)}
      />
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

    { !showAttributes && 
    <TemplateTab
      state={templateData}
      partialUpdate={updateTemplateData}
    />}
    
    { showAttributes && 
    <ConstituentaTab 
      state={cstData}
      partialUpdate={updateCstData}
    />}
  </div>
  </Modal>);
}

export default DlgTemplates;
