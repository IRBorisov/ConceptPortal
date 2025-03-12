'use client';

import { Suspense, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/loader1';
import { ModalForm } from '@/components/modal1';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs1';
import { useDialogsStore } from '@/stores/dialogs';

import { CstType, type IConstituentaBasicsDTO, type ICstCreateDTO, schemaCstCreate } from '../../backend/types';
import { useCstCreate } from '../../backend/use-cst-create';
import { type IRSForm } from '../../models/rsform';
import { generateAlias, validateNewAlias } from '../../models/rsform-api';
import { FormCreateCst } from '../dlg-create-cst/form-create-cst';

import { TabArguments } from './tab-arguments';
import { TabTemplate } from './tab-template';
import { TemplateState } from './template-context';

export interface DlgCstTemplateProps {
  schema: IRSForm;
  onCreate: (data: IConstituentaBasicsDTO) => void;
  insertAfter?: number;
}

export enum TabID {
  TEMPLATE = 0,
  ARGUMENTS = 1,
  CONSTITUENTA = 2
}

export function DlgCstTemplate() {
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
      className='w-172 h-140 px-6'
      canSubmit={isValid}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      helpTopic={HelpTopic.RSL_TEMPLATES}
    >
      <Tabs selectedTabClassName='clr-selected' className='grid' selectedIndex={activeTab} onSelect={setActiveTab}>
        <TabList className='mb-3 mx-auto flex border divide-x rounded-none bg-prim-200'>
          <TabLabel label='Шаблон' title='Выбор шаблона выражения' className='w-32' />
          <TabLabel label='Аргументы' title='Подстановка аргументов шаблона' className='w-32' />
          <TabLabel label='Конституента' title='Редактирование конституенты' className='w-32' />
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
