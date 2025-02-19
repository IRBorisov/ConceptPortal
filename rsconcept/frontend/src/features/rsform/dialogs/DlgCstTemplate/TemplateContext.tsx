'use client';

import { createContext, useContext, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useDialogsStore } from '@/stores/dialogs';

import { ICstCreateDTO } from '../../backend/types';
import { IConstituenta } from '../../models/rsform';
import { generateAlias } from '../../models/rsformAPI';
import { IArgumentValue } from '../../models/rslang';
import { inferTemplatedType, substituteTemplateArgs } from '../../models/rslangAPI';

import { DlgCstTemplateProps } from './DlgCstTemplate';

export interface ITemplateContext {
  args: IArgumentValue[];
  prototype: IConstituenta | null;
  templateID: number | null;
  filterCategory: IConstituenta | null;

  onChangeArguments: (newArgs: IArgumentValue[]) => void;
  onChangePrototype: (newPrototype: IConstituenta) => void;
  onChangeTemplateID: (newTemplateID: number | null) => void;
  onChangeFilterCategory: (newFilterCategory: IConstituenta | null) => void;
}

const TemplateContext = createContext<ITemplateContext | null>(null);
export const useTemplateContext = () => {
  const context = useContext(TemplateContext);
  if (context === null) {
    throw new Error('useTemplateContext has to be used within <TemplateState>');
  }
  return context;
};

export const TemplateState = ({ children }: React.PropsWithChildren) => {
  const { schema } = useDialogsStore(state => state.props as DlgCstTemplateProps);
  const { setValue } = useFormContext<ICstCreateDTO>();
  const [templateID, setTemplateID] = useState<number | null>(null);
  const [args, setArguments] = useState<IArgumentValue[]>([]);
  const [prototype, setPrototype] = useState<IConstituenta | null>(null);
  const [filterCategory, setFilterCategory] = useState<IConstituenta | null>(null);

  function onChangeArguments(newArgs: IArgumentValue[]) {
    setArguments(newArgs);
    if (newArgs.length === 0 || !prototype) {
      return;
    }

    const newType = inferTemplatedType(prototype.cst_type, newArgs);
    setValue('definition_formal', substituteTemplateArgs(prototype.definition_formal, newArgs));
    setValue('cst_type', newType);
    setValue('alias', generateAlias(newType, schema));
  }

  function onChangePrototype(newPrototype: IConstituenta) {
    setPrototype(newPrototype);
    setArguments(
      newPrototype.parse.args.map(arg => ({
        alias: arg.alias,
        typification: arg.typification,
        value: ''
      }))
    );
    setValue('cst_type', newPrototype.cst_type);
    setValue('alias', generateAlias(newPrototype.cst_type, schema));
    setValue('definition_formal', newPrototype.definition_formal);
    setValue('term_raw', newPrototype.term_raw);
    setValue('definition_raw', newPrototype.definition_raw);
  }

  function onChangeTemplateID(newTemplateID: number | null) {
    setTemplateID(newTemplateID);
    setPrototype(null);
    setArguments([]);
  }

  return (
    <TemplateContext
      value={{
        templateID,
        prototype,
        filterCategory,
        args,
        onChangeArguments,
        onChangePrototype,
        onChangeFilterCategory: setFilterCategory,
        onChangeTemplateID
      }}
    >
      {children}
    </TemplateContext>
  );
};
