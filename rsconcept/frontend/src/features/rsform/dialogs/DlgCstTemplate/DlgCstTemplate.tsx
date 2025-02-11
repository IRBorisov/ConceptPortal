'use client';

import clsx from 'clsx';
import { Suspense, useEffect, useState } from 'react';

import { Loader } from '@/components/Loader';
import { ModalForm } from '@/components/Modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/Tabs';
import { HelpTopic } from '@/features/help/models/helpTopic';
import usePartialUpdate from '@/hooks/usePartialUpdate';
import { useDialogsStore } from '@/stores/dialogs';
import { promptText } from '@/utils/labels';

import { ICstCreateDTO } from '../../backend/api';
import { useRSForm } from '../../backend/useRSForm';
import { CstType, IRSForm } from '../../models/rsform';
import { generateAlias, validateNewAlias } from '../../models/rsformAPI';
import { inferTemplatedType, substituteTemplateArgs } from '../../models/rslangAPI';
import FormCreateCst from '../DlgCreateCst/FormCreateCst';
import TabArguments, { IArgumentsState } from './TabArguments';
import TabTemplate, { ITemplateState } from './TabTemplate';

export interface DlgCstTemplateProps {
  schema: IRSForm;
  onCreate: (data: ICstCreateDTO) => void;
  insertAfter?: number;
}

export enum TabID {
  TEMPLATE = 0,
  ARGUMENTS = 1,
  CONSTITUENTA = 2
}

function DlgCstTemplate() {
  const { schema, onCreate, insertAfter } = useDialogsStore(state => state.props as DlgCstTemplateProps);
  const [activeTab, setActiveTab] = useState(TabID.TEMPLATE);

  const [template, updateTemplate] = usePartialUpdate<ITemplateState>({});
  const { schema: templateSchema } = useRSForm({ itemID: template.templateID });
  const [substitutes, updateSubstitutes] = usePartialUpdate<IArgumentsState>({
    definition: '',
    arguments: []
  });
  const [constituenta, updateConstituenta] = usePartialUpdate<ICstCreateDTO>({
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
    return true;
  }

  function handlePrompt(): boolean {
    const definedSomeArgs = substitutes.arguments.some(arg => !!arg.value);
    if (!definedSomeArgs && !window.confirm(promptText.templateUndefined)) {
      return false;
    }
    return true;
  }

  useEffect(() => {
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

  useEffect(() => {
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

  useEffect(() => {
    setValidated(!!template.prototype && validateNewAlias(constituenta.alias, constituenta.cst_type, schema));
  }, [constituenta.alias, constituenta.cst_type, schema, template.prototype]);

  return (
    <ModalForm
      header='Создание конституенты из шаблона'
      submitText='Создать'
      className='w-[43rem] h-[35rem] px-6'
      canSubmit={validated}
      beforeSubmit={handlePrompt}
      onSubmit={handleSubmit}
      helpTopic={HelpTopic.RSL_TEMPLATES}
    >
      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none', 'bg-prim-200')}>
          <TabLabel label='Шаблон' title='Выбор шаблона выражения' className='w-[8rem]' />
          <TabLabel label='Аргументы' title='Подстановка аргументов шаблона' className='w-[8rem]' />
          <TabLabel label='Конституента' title='Редактирование конституенты' className='w-[8rem]' />
        </TabList>

        <TabPanel>
          <Suspense fallback={<Loader />}>
            <TabTemplate state={template} partialUpdate={updateTemplate} templateSchema={templateSchema} />
          </Suspense>
        </TabPanel>

        <TabPanel>
          <TabArguments schema={schema} state={substitutes} partialUpdate={updateSubstitutes} />
        </TabPanel>

        <TabPanel>
          <div className='cc-fade-in cc-column'>
            <FormCreateCst state={constituenta} partialUpdate={updateConstituenta} schema={schema} />
          </div>
        </TabPanel>
      </Tabs>
    </ModalForm>
  );
}

export default DlgCstTemplate;
