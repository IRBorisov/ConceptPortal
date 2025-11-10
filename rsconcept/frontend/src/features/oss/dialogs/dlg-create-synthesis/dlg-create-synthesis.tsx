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

import { type ICreateSynthesisDTO, type IOssLayout, schemaCreateSynthesis } from '../../backend/types';
import { useCreateSynthesis } from '../../backend/use-create-synthesis';
import { useOssSuspense } from '../../backend/use-oss';
import { LayoutManager, OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '../../models/oss-layout-api';

import { TabArguments } from './tab-arguments';
import { TabSubstitutions } from './tab-substitutions';

export interface DlgCreateSynthesisProps {
  ossID: number;
  layout: IOssLayout;
  initialParent: number | null;
  initialInputs: number[];
  defaultX: number;
  defaultY: number;
  onCreate?: (newID: number) => void;
}

export const TabID = {
  ARGUMENTS: 0,
  SUBSTITUTIONS: 1
} as const;
export type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgCreateSynthesis() {
  const { createSynthesis } = useCreateSynthesis();

  const {
    ossID, //
    layout,
    initialInputs,
    initialParent,
    onCreate,
    defaultX,
    defaultY
  } = useDialogsStore(state => state.props as DlgCreateSynthesisProps);
  const { schema } = useOssSuspense({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);

  const methods = useForm<ICreateSynthesisDTO>({
    resolver: zodResolver(schemaCreateSynthesis),
    defaultValues: {
      item_data: {
        alias: '',
        title: '',
        description: '',
        parent: initialParent
      },
      position: {
        x: defaultX,
        y: defaultY,
        width: OPERATION_NODE_WIDTH,
        height: OPERATION_NODE_HEIGHT
      },
      arguments: initialInputs,
      substitutions: [],
      layout: manager.layout
    },
    mode: 'onChange'
  });
  const alias = useWatch({ control: methods.control, name: 'item_data.alias' });
  const [activeTab, setActiveTab] = useState<TabID>(TabID.ARGUMENTS);
  const { canSubmit, hint } = (() => {
    if (!alias) {
      return { canSubmit: false, hint: hintMsg.aliasEmpty };
    } else if (manager.oss.operations.some(operation => operation.alias === alias)) {
      return { canSubmit: false, hint: hintMsg.schemaAliasTaken };
    } else if (!methods.formState.isValid) {
      return { canSubmit: false, hint: hintMsg.formInvalid };
    } else {
      return { canSubmit: true, hint: '' };
    }
  })();

  function onSubmit(data: ICreateSynthesisDTO) {
    data.position = manager.newOperationPosition(data);
    data.layout = manager.layout;
    void createSynthesis({ itemID: manager.oss.id, data: data }).then(response => onCreate?.(response.new_operation));
  }

  return (
    <ModalForm
      header='Создание операции синтеза'
      submitText='Создать'
      canSubmit={canSubmit}
      validationHint={hint}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      className='w-180 px-6 h-128'
      helpTopic={HelpTopic.CC_OSS}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='z-pop mx-auto -mb-5 flex border divide-x rounded-none'>
          <TabLabel title='Выбор аргументов операции' label='Аргументы' className='w-32' />
          <TabLabel titleHtml='Таблица отождествлений' label='Отождествления' className='w-32' />
        </TabList>
        <FormProvider {...methods}>
          <TabPanel>
            <TabArguments oss={schema} />
          </TabPanel>
          <TabPanel>
            <Suspense
              fallback={
                <div className='w-full h-full flex items-center justify-center'>
                  <Loader circular />
                </div>
              }
            >
              <TabSubstitutions oss={schema} />
            </Suspense>
          </TabPanel>
        </FormProvider>
      </Tabs>
    </ModalForm>
  );
}
