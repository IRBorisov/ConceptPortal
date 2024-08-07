'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import BadgeHelp from '@/components/info/BadgeHelp';
import Modal from '@/components/ui/Modal';
import Overlay from '@/components/ui/Overlay';
import TabLabel from '@/components/ui/TabLabel';
import useRSFormCache from '@/hooks/useRSFormCache';
import { HelpTopic } from '@/models/miscellaneous';
import {
  ICstSubstitute,
  IOperation,
  IOperationSchema,
  IOperationUpdateData,
  OperationID,
  OperationType
} from '@/models/oss';
import { PARAMETER } from '@/utils/constants';

import TabArguments from './TabArguments';
import TabOperation from './TabOperation';
import TabSynthesis from './TabSynthesis';

interface DlgEditOperationProps {
  hideWindow: () => void;
  oss: IOperationSchema;
  target: IOperation;
  onSubmit: (data: IOperationUpdateData) => void;
}

export enum TabID {
  CARD = 0,
  ARGUMENTS = 1,
  SUBSTITUTION = 2
}

function DlgEditOperation({ hideWindow, oss, target, onSubmit }: DlgEditOperationProps) {
  const [activeTab, setActiveTab] = useState(TabID.CARD);

  const [alias, setAlias] = useState(target.alias);
  const [title, setTitle] = useState(target.title);
  const [comment, setComment] = useState(target.comment);

  const [inputs, setInputs] = useState<OperationID[]>(oss.graph.expandInputs([target.id]));
  const inputOperations = useMemo(() => inputs.map(id => oss.operationByID.get(id)!), [inputs, oss.operationByID]);
  const schemasIDs = useMemo(
    () => inputOperations.map(operation => operation.result).filter(id => id !== null),
    [inputOperations]
  );
  const [substitutions, setSubstitutions] = useState<ICstSubstitute[]>(target.substitutions);
  const cache = useRSFormCache();
  const schemas = useMemo(
    () => schemasIDs.map(id => cache.getSchema(id)).filter(item => item !== undefined),
    [schemasIDs, cache]
  );

  const isValid = useMemo(() => alias !== '', [alias]);

  useEffect(() => {
    cache.preload(schemasIDs);
  }, [schemasIDs]);

  const handleSubmit = () => {
    const data: IOperationUpdateData = {
      target: target.id,
      item_data: {
        alias: alias,
        title: title,
        comment: comment
      },
      positions: [],
      arguments: target.operation_type !== OperationType.SYNTHESIS ? undefined : inputs,
      substitutions: target.operation_type !== OperationType.SYNTHESIS ? undefined : substitutions
    };
    onSubmit(data);
  };

  const cardPanel = useMemo(
    () => (
      <TabPanel>
        <TabOperation
          alias={alias}
          setAlias={setAlias}
          comment={comment}
          setComment={setComment}
          title={title}
          setTitle={setTitle}
        />
      </TabPanel>
    ),
    [alias, comment, title, setAlias]
  );

  const argumentsPanel = useMemo(
    () => (
      <TabPanel>
        <TabArguments
          target={target.id} // prettier: split-lines
          oss={oss}
          inputs={inputs}
          setInputs={setInputs}
        />
      </TabPanel>
    ),
    [oss, target, inputs, setInputs]
  );

  const synthesisPanel = useMemo(
    () => (
      <TabPanel>
        <TabSynthesis
          schemas={schemas}
          loading={cache.loading}
          error={cache.error}
          substitutions={substitutions}
          setSubstitutions={setSubstitutions}
        />
      </TabPanel>
    ),
    [cache.loading, cache.error, substitutions, schemas]
  );

  return (
    <Modal
      header='Редактирование операции'
      submitText='Сохранить'
      hideWindow={hideWindow}
      canSubmit={isValid}
      onSubmit={handleSubmit}
      className='w-[40rem] px-6 min-h-[35rem]'
    >
      <Overlay position='top-0 right-0'>
        <BadgeHelp topic={HelpTopic.CC_OSS} className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')} offset={14} />
      </Overlay>

      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none')}>
          <TabLabel title='Текстовые поля' label='Карточка' className='w-[8rem]' />
          {target.operation_type === OperationType.SYNTHESIS ? (
            <TabLabel title='Выбор аргументов операции' label='Аргументы' className='w-[8rem]' />
          ) : null}
          {target.operation_type === OperationType.SYNTHESIS ? (
            <TabLabel title='Таблица отождествлений' label='Отождествления' className='w-[8rem]' />
          ) : null}
        </TabList>

        {cardPanel}
        {target.operation_type === OperationType.SYNTHESIS ? argumentsPanel : null}
        {target.operation_type === OperationType.SYNTHESIS ? synthesisPanel : null}
      </Tabs>
    </Modal>
  );
}

export default DlgEditOperation;
