'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import Modal from '@/components/ui/Modal';
import TabLabel from '@/components/ui/TabLabel';
import useRSFormCache from '@/hooks/useRSFormCache';
import { LibraryItemID } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import {
  ICstSubstitute,
  IOperation,
  IOperationSchema,
  IOperationUpdateData,
  OperationID,
  OperationType
} from '@/models/oss';
import { SubstitutionValidator } from '@/models/ossAPI';
import { ConstituentaID } from '@/models/rsform';

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

  const [isCorrect, setIsCorrect] = useState(true);
  const [validationText, setValidationText] = useState('');

  const initialInputs = oss.graph.expandInputs([target.id]);
  const [inputs, setInputs] = useState<OperationID[]>(initialInputs);
  const inputOperations = inputs.map(id => oss.operationByID.get(id)!);

  const [needPreload, setNeedPreload] = useState(false);
  const [schemasIDs, setSchemaIDs] = useState<LibraryItemID[]>([]);

  const [substitutions, setSubstitutions] = useState<ICstSubstitute[]>(target.substitutions);
  const [suggestions, setSuggestions] = useState<ICstSubstitute[]>([]);

  const cache = useRSFormCache();
  const schemas = schemasIDs.map(id => cache.data.find(item => item.id === id)).filter(item => item !== undefined);

  const isModified =
    alias !== target.alias ||
    title !== target.title ||
    comment !== target.comment ||
    JSON.stringify(initialInputs) !== JSON.stringify(inputs) ||
    JSON.stringify(substitutions) !== JSON.stringify(target.substitutions);

  const canSubmit = isModified && alias !== '';

  const getSchemaByCst = useCallback(
    (id: ConstituentaID) => {
      for (const schema of cache.data) {
        const cst = schema.items.find(cst => cst.id === id);
        if (cst) {
          return schema;
        }
      }
      return undefined;
    },
    [cache.data]
  );

  useEffect(() => {
    setNeedPreload(true);
    setSchemaIDs(inputOperations.map(operation => operation.result).filter(id => id !== null));
  }, [inputOperations]);

  useEffect(() => {
    if (needPreload) {
      setNeedPreload(false);
      cache.preload(schemasIDs);
    }
  }, [schemasIDs, needPreload, cache]);

  useEffect(() => {
    if (cache.loading || schemas.length !== schemasIDs.length || schemas.length === 0) {
      return;
    }
    setSubstitutions(prev =>
      prev.filter(sub => {
        const original = getSchemaByCst(sub.original);
        if (!original || !schemasIDs.includes(original.id)) {
          return false;
        }
        const substitution = getSchemaByCst(sub.substitution);
        if (!substitution || !schemasIDs.includes(substitution.id)) {
          return false;
        }
        return true;
      })
    );
  }, [schemasIDs, schemas, cache.loading, getSchemaByCst]);

  useEffect(() => {
    if (cache.loading || schemas.length !== schemasIDs.length || schemas.length === 0) {
      return;
    }
    const validator = new SubstitutionValidator(schemas, substitutions);
    setIsCorrect(validator.validate());
    setValidationText(validator.msg);
    setSuggestions(validator.suggestions);
  }, [substitutions, cache.loading, schemas, schemasIDs.length]);

  function handleSubmit() {
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
  }

  return (
    <Modal
      header='Редактирование операции'
      submitText='Сохранить'
      hideWindow={hideWindow}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      className='w-[40rem] px-6 h-[32rem]'
      helpTopic={HelpTopic.UI_SUBSTITUTIONS}
      hideHelpWhen={() => activeTab !== TabID.SUBSTITUTION}
    >
      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none', 'bg-prim-200')}>
          <TabLabel title='Текстовые поля' label='Карточка' className='w-[8rem]' />
          {target.operation_type === OperationType.SYNTHESIS ? (
            <TabLabel title='Выбор аргументов операции' label='Аргументы' className='w-[8rem]' />
          ) : null}
          {target.operation_type === OperationType.SYNTHESIS ? (
            <TabLabel
              titleHtml={'Таблица отождествлений' + (isCorrect ? '' : '<br/>(не прошла проверку)')}
              label={isCorrect ? 'Отождествления' : 'Отождествления*'}
              className='w-[8rem]'
            />
          ) : null}
        </TabList>

        <TabPanel>
          <TabOperation
            alias={alias}
            onChangeAlias={setAlias}
            comment={comment}
            onChangeComment={setComment}
            title={title}
            onChangeTitle={setTitle}
          />
        </TabPanel>

        {target.operation_type === OperationType.SYNTHESIS ? (
          <TabPanel>
            <TabArguments
              target={target.id} // prettier: split-lines
              oss={oss}
              inputs={inputs}
              setInputs={setInputs}
            />
          </TabPanel>
        ) : null}
        {target.operation_type === OperationType.SYNTHESIS ? (
          <TabPanel>
            <TabSynthesis
              schemas={schemas}
              loading={cache.loading}
              error={cache.error}
              validationText={validationText}
              isCorrect={isCorrect}
              substitutions={substitutions}
              setSubstitutions={setSubstitutions}
              suggestions={suggestions}
            />
          </TabPanel>
        ) : null}
      </Tabs>
    </Modal>
  );
}

export default DlgEditOperation;
