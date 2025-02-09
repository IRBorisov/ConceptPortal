'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';

import { ModalForm } from '@/components/Modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/Tabs';
import { HelpTopic } from '@/features/help/models/helpTopic';
import { LibraryItemID } from '@/features/library/models/library';
import { useRSForms } from '@/features/rsform/backend/useRSForms';
import { ConstituentaID } from '@/features/rsform/models/rsform';
import { useDialogsStore } from '@/stores/dialogs';

import { IOperationUpdateDTO } from '../../backend/api';
import { ICstSubstitute, IOperation, IOperationSchema, OperationID, OperationType } from '../../models/oss';
import { SubstitutionValidator } from '../../models/ossAPI';
import TabArguments from './TabArguments';
import TabOperation from './TabOperation';
import TabSynthesis from './TabSynthesis';

export interface DlgEditOperationProps {
  oss: IOperationSchema;
  target: IOperation;
  onSubmit: (data: IOperationUpdateDTO) => void;
}

export enum TabID {
  CARD = 0,
  ARGUMENTS = 1,
  SUBSTITUTION = 2
}

function DlgEditOperation() {
  const { oss, target, onSubmit } = useDialogsStore(state => state.props as DlgEditOperationProps);
  const [activeTab, setActiveTab] = useState(TabID.CARD);

  const [alias, setAlias] = useState(target.alias);
  const [title, setTitle] = useState(target.title);
  const [comment, setComment] = useState(target.comment);

  const [isCorrect, setIsCorrect] = useState(true);
  const [validationText, setValidationText] = useState('');

  const initialInputs = oss.graph.expandInputs([target.id]);
  const [inputs, setInputs] = useState<OperationID[]>(initialInputs);
  const inputOperations = inputs.map(id => oss.operationByID.get(id)!);

  const [substitutions, setSubstitutions] = useState<ICstSubstitute[]>(target.substitutions);
  const [suggestions, setSuggestions] = useState<ICstSubstitute[]>([]);

  const [schemasIDs, setSchemaIDs] = useState<LibraryItemID[]>([]);
  const schemas = useRSForms(schemasIDs);

  const isModified =
    alias !== target.alias ||
    title !== target.title ||
    comment !== target.comment ||
    JSON.stringify(initialInputs) !== JSON.stringify(inputs) ||
    JSON.stringify(substitutions) !== JSON.stringify(target.substitutions);

  const canSubmit = isModified && alias !== '';

  const getSchemaByCst = useCallback(
    (id: ConstituentaID) => {
      for (const schema of schemas) {
        const cst = schema.items.find(cst => cst.id === id);
        if (cst) {
          return schema;
        }
      }
      return undefined;
    },
    [schemas]
  );

  useEffect(() => {
    setSchemaIDs(inputOperations.map(operation => operation.result).filter(id => id !== null));
  }, [inputOperations]);

  useEffect(() => {
    if (schemas.length !== schemasIDs.length || schemas.length === 0) {
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
  }, [schemasIDs, schemas, getSchemaByCst]);

  useEffect(() => {
    if (schemas.length !== schemasIDs.length || schemas.length === 0) {
      return;
    }
    const validator = new SubstitutionValidator(schemas, substitutions);
    setIsCorrect(validator.validate());
    setValidationText(validator.msg);
    setSuggestions(validator.suggestions);
  }, [substitutions, schemas, schemasIDs.length]);

  function handleSubmit() {
    onSubmit({
      target: target.id,
      item_data: {
        alias: alias,
        title: title,
        comment: comment
      },
      positions: [],
      arguments: target.operation_type !== OperationType.SYNTHESIS ? undefined : inputs,
      substitutions: target.operation_type !== OperationType.SYNTHESIS ? undefined : substitutions
    });
    return true;
  }

  return (
    <ModalForm
      header='Редактирование операции'
      submitText='Сохранить'
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
              validationText={validationText}
              isCorrect={isCorrect}
              substitutions={substitutions}
              setSubstitutions={setSubstitutions}
              suggestions={suggestions}
            />
          </TabPanel>
        ) : null}
      </Tabs>
    </ModalForm>
  );
}

export default DlgEditOperation;
