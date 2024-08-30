'use client';

import clsx from 'clsx';
import { useLayoutEffect, useMemo, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import BadgeHelp from '@/components/info/BadgeHelp';
import Modal, { ModalProps } from '@/components/ui/Modal';
import Overlay from '@/components/ui/Overlay';
import TabLabel from '@/components/ui/TabLabel';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useLibrary } from '@/context/LibraryContext';
import usePartialUpdate from '@/hooks/usePartialUpdate';
import { HelpTopic } from '@/models/miscellaneous';
import { CstType, ICstCreateData, IRSForm } from '@/models/rsform';
import { generateAlias, validateNewAlias } from '@/models/rsformAPI';
import { inferTemplatedType, substituteTemplateArgs } from '@/models/rslangAPI';
import { PARAMETER } from '@/utils/constants';
import { prompts } from '@/utils/labels';

import FormCreateCst from '../DlgCreateCst/FormCreateCst';
import TabArguments, { IArgumentsState } from './TabArguments';
import TabTemplate, { ITemplateState } from './TabTemplate';

interface DlgConstituentaTemplateProps extends Pick<ModalProps, 'hideWindow'> {
  schema: IRSForm;
  onCreate: (data: ICstCreateData) => void;
  insertAfter?: number;
}

export enum TabID {
  TEMPLATE = 0,
  ARGUMENTS = 1,
  CONSTITUENTA = 2
}

function DlgConstituentaTemplate({ hideWindow, schema, onCreate, insertAfter }: DlgConstituentaTemplateProps) {
  const { retrieveTemplate } = useLibrary();
  const [activeTab, setActiveTab] = useState(TabID.TEMPLATE);

  const [templateSchema, setTemplateSchema] = useState<IRSForm | undefined>(undefined);
  const [template, updateTemplate] = usePartialUpdate<ITemplateState>({});
  const [substitutes, updateSubstitutes] = usePartialUpdate<IArgumentsState>({
    definition: '',
    arguments: []
  });
  const [constituenta, updateConstituenta] = usePartialUpdate<ICstCreateData>({
    cst_type: CstType.TERM,
    insert_after: insertAfter ?? null,
    alias: generateAlias(CstType.TERM, schema),
    convention: '',
    definition_formal: '',
    definition_raw: '',
    term_raw: '',
    term_forms: []
  });

  const [validated, setValidated] = useState(false);

  function handleSubmit() {
    onCreate(constituenta);
  }

  function handlePrompt(): boolean {
    const definedSomeArgs = substitutes.arguments.some(arg => !!arg.value);
    if (!definedSomeArgs && !window.confirm(prompts.templateUndefined)) {
      return false;
    }
    return true;
  }

  useLayoutEffect(() => {
    if (!template.templateID) {
      setTemplateSchema(undefined);
    } else {
      retrieveTemplate(template.templateID, setTemplateSchema);
    }
  }, [template.templateID, retrieveTemplate]);

  useLayoutEffect(() => {
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
        alias: generateAlias(template.prototype.cst_type, schema),
        definition_raw: template.prototype.definition_raw,
        definition_formal: template.prototype.definition_formal,
        term_raw: template.prototype.term_raw
      });
      updateSubstitutes({
        definition: template.prototype.definition_formal,
        arguments: template.prototype.parse.args.map(arg => ({
          alias: arg.alias,
          typification: arg.typification,
          value: ''
        }))
      });
    }
  }, [template.prototype, updateConstituenta, updateSubstitutes, schema]);

  useLayoutEffect(() => {
    if (substitutes.arguments.length === 0 || !template.prototype) {
      return;
    }
    const definition = substituteTemplateArgs(template.prototype.definition_formal, substitutes.arguments);
    const type = inferTemplatedType(template.prototype.cst_type, substitutes.arguments);
    updateConstituenta({
      cst_type: type,
      alias: generateAlias(type, schema),
      definition_formal: definition
    });
    updateSubstitutes({
      definition: definition
    });
  }, [substitutes.arguments, template.prototype, updateConstituenta, updateSubstitutes, schema]);

  useLayoutEffect(() => {
    setValidated(!!template.prototype && validateNewAlias(constituenta.alias, constituenta.cst_type, schema));
  }, [constituenta.alias, constituenta.cst_type, schema, template.prototype]);

  const templatePanel = useMemo(
    () => (
      <TabPanel>
        <TabTemplate state={template} partialUpdate={updateTemplate} templateSchema={templateSchema} />
      </TabPanel>
    ),
    [template, templateSchema, updateTemplate]
  );

  const argumentsPanel = useMemo(
    () => (
      <TabPanel>
        <TabArguments schema={schema} state={substitutes} partialUpdate={updateSubstitutes} />
      </TabPanel>
    ),
    [schema, substitutes, updateSubstitutes]
  );

  const editorPanel = useMemo(
    () => (
      <TabPanel>
        <AnimateFade className='cc-column'>
          <FormCreateCst state={constituenta} partialUpdate={updateConstituenta} schema={schema} />
        </AnimateFade>
      </TabPanel>
    ),
    [constituenta, updateConstituenta, schema]
  );

  return (
    <Modal
      header='Создание конституенты из шаблона'
      submitText='Создать'
      className='w-[43rem] h-[36.5rem] px-6'
      hideWindow={hideWindow}
      canSubmit={validated}
      beforeSubmit={handlePrompt}
      onSubmit={handleSubmit}
    >
      <Overlay position='top-0 right-[6rem]'>
        <BadgeHelp
          topic={HelpTopic.RSL_TEMPLATES}
          className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
          offset={12}
        />
      </Overlay>
      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none')}>
          <TabLabel label='Шаблон' title='Выбор шаблона выражения' className='w-[8rem]' />
          <TabLabel label='Аргументы' title='Подстановка аргументов шаблона' className='w-[8rem]' />
          <TabLabel label='Конституента' title='Редактирование конституенты' className='w-[8rem]' />
        </TabList>

        {templatePanel}
        {argumentsPanel}
        {editorPanel}
      </Tabs>
    </Modal>
  );
}

export default DlgConstituentaTemplate;
