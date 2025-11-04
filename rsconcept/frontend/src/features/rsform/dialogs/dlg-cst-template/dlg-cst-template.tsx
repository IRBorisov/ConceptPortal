'use client';

import { Suspense, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';

import {
  type IConstituentaBasicsDTO,
  type ICreateConstituentaDTO,
  schemaCreateConstituenta
} from '../../backend/types';
import { useCreateConstituenta } from '../../backend/use-create-constituenta';
import { useRSFormSuspense } from '../../backend/use-rsform';
import { validateNewAlias } from '../../models/rsform-api';
import { FormCreateCst } from '../dlg-create-cst/form-create-cst';

import { TabArguments } from './tab-arguments';
import { TabTemplate } from './tab-template';
import { TemplateState } from './template-state';

export interface DlgCstTemplateProps {
  schemaID: number;
  onCreate: (data: RO<IConstituentaBasicsDTO>) => void;
  insertAfter?: number;
}

export const TabID = {
  TEMPLATE: 0,
  ARGUMENTS: 1,
  CONSTITUENTA: 2
} as const;
export type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgCstTemplate() {
  const { schemaID, onCreate, insertAfter } = useDialogsStore(state => state.props as DlgCstTemplateProps);
  const { createConstituenta: cstCreate } = useCreateConstituenta();
  const { schema } = useRSFormSuspense({ itemID: schemaID });

  const methods = useForm<ICreateConstituentaDTO>({
    mode: 'onChange',
    resolver: zodResolver(schemaCreateConstituenta),
    defaultValues: {
      insert_after: insertAfter ?? null,
      crucial: false,
      cst_type: undefined,
      alias: '',
      convention: '',
      definition_formal: '',
      definition_raw: '',
      term_raw: '',
      term_forms: []
    }
  });
  const alias = useWatch({ control: methods.control, name: 'alias' });
  const cst_type = useWatch({ control: methods.control, name: 'cst_type' });
  const { canSubmit, hint } = (() => {
    if (!cst_type) {
      return { canSubmit: false, hint: hintMsg.templateInvalid };
    } else if (!methods.formState.isValid) {
      return { canSubmit: false, hint: hintMsg.formInvalid };
    } else if (!validateNewAlias(alias, cst_type, schema)) {
      return { canSubmit: false, hint: hintMsg.aliasInvalid };
    } else {
      return { canSubmit: true, hint: '' };
    }
  })();

  const [activeTab, setActiveTab] = useState<TabID>(TabID.TEMPLATE);

  function onSubmit(data: ICreateConstituentaDTO) {
    return cstCreate({ itemID: schema.id, data }).then(onCreate);
  }

  return (
    <ModalForm
      header='Создание конституенты из шаблона'
      submitText='Создать'
      className='w-172 h-140 px-6'
      canSubmit={canSubmit}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      validationHint={hint}
      helpTopic={HelpTopic.RSL_TEMPLATES}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='mb-3 mx-auto flex border divide-x rounded-none'>
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
              <TabArguments schema={schema} />
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
