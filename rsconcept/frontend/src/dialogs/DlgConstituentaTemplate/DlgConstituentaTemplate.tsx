'use client';

import clsx from 'clsx';
import { useLayoutEffect, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import ConceptTab from '@/components/Common/ConceptTab';
import Modal, { ModalProps } from '@/components/Common/Modal';
import Overlay from '@/components/Common/Overlay';
import HelpButton from '@/components/Help/HelpButton';
import usePartialUpdate from '@/hooks/usePartialUpdate';
import { HelpTopic } from '@/models/miscelanious';
import { CstType, ICstCreateData, IRSForm } from '@/models/rsform';
import { inferTemplatedType, substituteTemplateArgs } from '@/models/rslangAPI';
import { createAliasFor, validateCstAlias } from '@/utils/misc';

import ArgumentsTab, { IArgumentsState } from './ArgumentsTab';
import ConstituentaTab from './ConstituentaTab';
import TemplateTab, { ITemplateState } from './TemplateTab';

interface DlgConstituentaTemplateProps
extends Pick<ModalProps, 'hideWindow'> {
  schema: IRSForm
  onCreate: (data: ICstCreateData) => void
  insertAfter?: number
}

export enum TabID {
  TEMPLATE = 0,
  ARGUMENTS = 1,
  CONSTITUENTA = 2
}

function DlgConstituentaTemplate({ hideWindow, schema, onCreate, insertAfter }: DlgConstituentaTemplateProps) {
  const [validated, setValidated] = useState(false);
  const [template, updateTemplate] = usePartialUpdate<ITemplateState>({});
  const [substitutes, updateSubstitutes] = usePartialUpdate<IArgumentsState>({
    definition: '',
    arguments: []
  });
  const [constituenta, updateConstituenta] = usePartialUpdate<ICstCreateData>({
    cst_type: CstType.TERM,
    insert_after: insertAfter ?? null,
    alias: '',
    convention: '',
    definition_formal: '',
    definition_raw: '',
    term_raw: '',
    term_forms: []
  });
  
  const [activeTab, setActiveTab] = useState(TabID.TEMPLATE);

  const handleSubmit = () => onCreate(constituenta);
  
  useLayoutEffect(
  () => {
    updateConstituenta({ alias: createAliasFor(constituenta.cst_type, schema) });
  }, [constituenta.cst_type, updateConstituenta, schema]);

  useLayoutEffect(
  () => {
    setValidated(validateCstAlias(constituenta.alias, constituenta.cst_type, schema));
  }, [constituenta.alias, constituenta.cst_type, schema]);

  useLayoutEffect(
  () => {
    if (!template.prototype) {
      updateConstituenta({
        definition_raw: '',
        definition_formal: '',
        term_raw: ''
      });
      updateSubstitutes({
        definition: '',
        arguments: []
      });
    } else {
      updateConstituenta({
        cst_type: template.prototype.cst_type,
        definition_raw: template.prototype.definition_raw,
        definition_formal: template.prototype.definition_formal,
        term_raw:  template.prototype.term_raw
      });
      updateSubstitutes({
        definition: template.prototype.definition_formal,
        arguments: template.prototype.parse.args.map(
          arg => ({
            alias: arg.alias,
            typification: arg.typification,
            value: ''
          })
        )
      });
    }
  }, [template.prototype, updateConstituenta, updateSubstitutes]);

  useLayoutEffect(
  () => {
    if (substitutes.arguments.length === 0 || !template.prototype) {
      return;
    }
    const definition = substituteTemplateArgs(template.prototype.definition_formal, substitutes.arguments);
    const type = inferTemplatedType(template.prototype.cst_type, substitutes.arguments);
    updateConstituenta({
      cst_type: type,
      definition_formal: definition,
    });
    updateSubstitutes({
      definition: definition,
    });
  }, [substitutes.arguments, template.prototype, updateConstituenta, updateSubstitutes]);

  return (
  <Modal
    title='Создание конституенты из шаблона'
    hideWindow={hideWindow}
    canSubmit={validated}
    onSubmit={handleSubmit}
    submitText='Создать'
    className='max-w-[43rem] min-w-[43rem] min-h-[36rem] px-6'
  >
    <Overlay position='top-0 right-[6rem]'>
      <HelpButton topic={HelpTopic.RSTEMPLATES} dimensions='max-w-[35rem]' />
    </Overlay>
    <Tabs forceRenderTabPanel
      selectedTabClassName='clr-selected'
      className='flex flex-col'
      selectedIndex={activeTab}
      onSelect={setActiveTab}
    >
      <TabList className={clsx(
        'mb-3 self-center',
        'flex',
        'border divide-x rounded-none'
      )}>
        <ConceptTab
          label='Шаблон'
          tooltip='Выбор шаблона выражения'
          className='w-[8rem]'
        />
        <ConceptTab
          label='Аргументы'
          tooltip='Подстановка аргументов шаблона'
          className='w-[8rem]'
        />
        <ConceptTab
          label='Конституента'
          tooltip='Редактирование атрибутов конституенты'
          className='w-[8rem]'
        />
      </TabList>
      
      <TabPanel style={{ display: activeTab === TabID.TEMPLATE ? '': 'none' }}>
      <TemplateTab
        state={template}
        partialUpdate={updateTemplate}
      />
      </TabPanel>

      <TabPanel style={{ display: activeTab === TabID.ARGUMENTS ? '': 'none' }}>
      <ArgumentsTab
        schema={schema}
        state={substitutes}
        partialUpdate={updateSubstitutes}
      />
      </TabPanel>

      <TabPanel style={{ display: activeTab === TabID.CONSTITUENTA ? '': 'none' }}>
      <ConstituentaTab 
        state={constituenta}
        partialUpdate={updateConstituenta}
      />
      </TabPanel>
    </Tabs>
  </Modal>);
}

export default DlgConstituentaTemplate;