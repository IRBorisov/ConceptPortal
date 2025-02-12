'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { Suspense, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { Loader } from '@/components/Loader';
import { ModalForm } from '@/components/Modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/Tabs';
import { useDialogsStore } from '@/stores/dialogs';

import { IInlineSynthesisDTO, schemaInlineSynthesis } from '../../backend/api';
import { useInlineSynthesis } from '../../backend/useInlineSynthesis';
import { IRSForm } from '../../models/rsform';
import TabConstituents from './TabConstituents';
import TabSource from './TabSource';
import TabSubstitutions from './TabSubstitutions';

export interface DlgInlineSynthesisProps {
  receiver: IRSForm;
  onSynthesis: () => void;
}

export enum TabID {
  SCHEMA = 0,
  SELECTIONS = 1,
  SUBSTITUTIONS = 2
}

function DlgInlineSynthesis() {
  const { receiver, onSynthesis } = useDialogsStore(state => state.props as DlgInlineSynthesisProps);
  const [activeTab, setActiveTab] = useState(TabID.SCHEMA);
  const { inlineSynthesis } = useInlineSynthesis();

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

  function onSubmit(data: IInlineSynthesisDTO) {
    return inlineSynthesis(data).then(onSynthesis);
  }

  return (
    <ModalForm
      header='Импорт концептуальной схем'
      submitText='Добавить конституенты'
      className='w-[40rem] h-[33rem] px-6'
      canSubmit={methods.formState.isValid && sourceID !== null}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
    >
      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none', 'bg-prim-200')}>
          <TabLabel label='Схема' title='Источник конституент' className='w-[8rem]' />
          <TabLabel
            label='Содержание'
            title={!sourceID ? 'Выберите схему' : 'Перечень конституент'}
            className='w-[8rem]'
            disabled={!sourceID}
          />
          <TabLabel
            label='Отождествления'
            title={!sourceID ? 'Выберите схему' : 'Таблица отождествлений'}
            className='w-[8rem]'
            disabled={!sourceID}
          />
        </TabList>

        <FormProvider {...methods}>
          <TabPanel>
            <TabSource />
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
                <TabSubstitutions />
              </Suspense>
            ) : null}
          </TabPanel>
        </FormProvider>
      </Tabs>
    </ModalForm>
  );
}

export default DlgInlineSynthesis;
