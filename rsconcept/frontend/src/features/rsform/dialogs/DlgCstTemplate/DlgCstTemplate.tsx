'use client';

import { Suspense, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/Loader';
import { ModalForm } from '@/components/Modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/Tabs';
import { useDialogsStore } from '@/stores/dialogs';

import { ICstCreateDTO, schemaCstCreate } from '../../backend/types';
import { useCstCreate } from '../../backend/useCstCreate';
import { CstType, IConstituentaMeta, IRSForm } from '../../models/rsform';
import { generateAlias, validateNewAlias } from '../../models/rsformAPI';
import FormCreateCst from '../DlgCreateCst/FormCreateCst';

import TabArguments from './TabArguments';
import TabTemplate from './TabTemplate';
import { TemplateState } from './TemplateContext';

export interface DlgCstTemplateProps {
  schema: IRSForm;
  onCreate: (data: IConstituentaMeta) => void;
  insertAfter?: number;
}

export enum TabID {
  TEMPLATE = 0,
  ARGUMENTS = 1,
  CONSTITUENTA = 2
}

function DlgCstTemplate() {
  const { schema, onCreate, insertAfter } = useDialogsStore(state => state.props as DlgCstTemplateProps);
  const { cstCreate } = useCstCreate();

  const methods = useForm<ICstCreateDTO>({
    resolver: zodResolver(schemaCstCreate),
    defaultValues: {
      cst_type: CstType.TERM,
      insert_after: insertAfter ?? null,
      alias: generateAlias(CstType.TERM, schema),
      convention: '',
      definition_formal: '',
      definition_raw: '',
      term_raw: '',
      term_forms: []
    }
  });
  const alias = useWatch({ control: methods.control, name: 'alias' });
  const cst_type = useWatch({ control: methods.control, name: 'cst_type' });
  const isValid = validateNewAlias(alias, cst_type, schema);

  const [activeTab, setActiveTab] = useState(TabID.TEMPLATE);

  function onSubmit(data: ICstCreateDTO) {
    return cstCreate({ itemID: schema.id, data }).then(onCreate);
  }

  return (
    <ModalForm
      header='Создание конституенты из шаблона'
      submitText='Создать'
      className='w-[43rem] h-[35rem] px-6'
      canSubmit={isValid}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
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

        <FormProvider {...methods}>
          <TemplateState>
            <TabPanel>
              <Suspense fallback={<Loader />}>
                <TabTemplate />
              </Suspense>
            </TabPanel>

            <TabPanel>
              <TabArguments />
            </TabPanel>

            <TabPanel>
              <div className='cc-fade-in cc-column'>
                <FormCreateCst schema={schema} />
              </div>
            </TabPanel>
          </TemplateState>
        </FormProvider>
      </Tabs>
    </ModalForm>
  );
}

export default DlgCstTemplate;
