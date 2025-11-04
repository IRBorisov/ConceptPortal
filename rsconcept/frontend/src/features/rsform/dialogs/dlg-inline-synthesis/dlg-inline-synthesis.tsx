'use client';

import { Suspense, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { type IInlineSynthesisDTO, schemaInlineSynthesis } from '../../backend/types';
import { useInlineSynthesis } from '../../backend/use-inline-synthesis';
import { useRSFormSuspense } from '../../backend/use-rsform';

import { TabConstituents } from './tab-constituents';
import { TabSource } from './tab-source';
import { TabSubstitutions } from './tab-substitutions';

export interface DlgInlineSynthesisProps {
  receiverID: number;
  onSynthesis: () => void;
}

export const TabID = {
  SCHEMA: 0,
  SELECTIONS: 1,
  SUBSTITUTIONS: 2
} as const;
export type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgInlineSynthesis() {
  const { receiverID, onSynthesis } = useDialogsStore(state => state.props as DlgInlineSynthesisProps);
  const [activeTab, setActiveTab] = useState<TabID>(TabID.SCHEMA);
  const { inlineSynthesis } = useInlineSynthesis();
  const { schema: receiver } = useRSFormSuspense({ itemID: receiverID });

  const methods = useForm<IInlineSynthesisDTO>({
    resolver: zodResolver(schemaInlineSynthesis),
    defaultValues: {
      receiver: receiver.id,
      source: null,
      items: [],
      substitutions: []
    },
    mode: 'onChange'
  });
  const sourceID = useWatch({ control: methods.control, name: 'source' });
  const canSubmit = methods.formState.isValid && sourceID !== null;

  function onSubmit(data: IInlineSynthesisDTO) {
    return inlineSynthesis(data).then(onSynthesis);
  }

  return (
    <ModalForm
      header='Импорт концептуальной схем'
      submitText='Добавить конституенты'
      className='w-160 h-132 px-6'
      canSubmit={canSubmit}
      validationHint={canSubmit ? '' : hintMsg.sourceEmpty}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='mb-3 mx-auto flex border divide-x rounded-none'>
          <TabLabel
            label='Схема' //
            title='Источник конституент'
            className='w-32'
          />
          <TabLabel
            label='Конституенты'
            title={!sourceID ? 'Выберите схему' : 'Перечень конституент'}
            className='w-32'
            disabled={!sourceID}
          />
          <TabLabel
            label='Отождествления'
            title={!sourceID ? 'Выберите схему' : 'Таблица отождествлений'}
            className='w-32'
            disabled={!sourceID}
          />
        </TabList>

        <FormProvider {...methods}>
          <TabPanel>
            <TabSource receiver={receiver} />
          </TabPanel>

          <TabPanel>
            {!!sourceID ? (
              <Suspense fallback={<Loader />}>
                <TabConstituents />
              </Suspense>
            ) : null}
          </TabPanel>

          <TabPanel>
            {!!sourceID ? (
              <Suspense fallback={<Loader />}>
                <TabSubstitutions receiver={receiver} />
              </Suspense>
            ) : null}
          </TabPanel>
        </FormProvider>
      </Tabs>
    </ModalForm>
  );
}
