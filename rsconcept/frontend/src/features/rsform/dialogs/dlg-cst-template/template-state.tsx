'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateConstituentaDTO } from '../../backend/types';
import { type IConstituenta } from '../../models/rsform';
import { generateAlias } from '../../models/rsform-api';
import { type IArgumentValue } from '../../models/rslang';
import { inferTemplatedType, substituteTemplateArgs } from '../../models/rslang-api';

import { type DlgCstTemplateProps } from './dlg-cst-template';
import { TemplateContext } from './template-context';

export const TemplateState = ({ children }: React.PropsWithChildren) => {
  const { schema } = useDialogsStore(state => state.props as DlgCstTemplateProps);
  const { setValue } = useFormContext<ICreateConstituentaDTO>();
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
