'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useTemplatesSuspense } from '@/features/library/backend/use-templates';
import { type AliasMapping, substituteTemplateArgs } from '@/features/rslang/api';

import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateConstituentaDTO } from '../../backend/types';
import { useRSFormSuspense } from '../../backend/use-rsform';
import { type IArgumentValue, type IConstituenta } from '../../models/rsform';
import { generateAlias, inferTemplatedType } from '../../models/rsform-api';

import { type DlgCstTemplateProps } from './dlg-cst-template';
import { TemplateContext } from './template-context';

export const TemplateState = ({ children }: React.PropsWithChildren) => {
  const { schemaID } = useDialogsStore(state => state.props as DlgCstTemplateProps);
  const { schema } = useRSFormSuspense({ itemID: schemaID });
  const { templates } = useTemplatesSuspense();
  const { setValue } = useFormContext<ICreateConstituentaDTO>();

  const [templateID, setTemplateID] = useState<number | null>(templates.length > 0 ? templates[0].id : null);
  const [args, setArguments] = useState<IArgumentValue[]>([]);
  const [prototype, setPrototype] = useState<IConstituenta | null>(null);
  const [filterCategory, setFilterCategory] = useState<IConstituenta | null>(null);

  function onChangeArguments(newArgs: IArgumentValue[]) {
    setArguments(newArgs);
    if (newArgs.length === 0 || !prototype) {
      return;
    }

    const newType = inferTemplatedType(prototype.cst_type, newArgs);

    const mapping: AliasMapping = {};
    newArgs
      .filter(arg => !!arg.value)
      .forEach(arg => {
        mapping[arg.alias] = arg.value!;
      });

    setValue('definition_formal', substituteTemplateArgs(prototype.definition_formal, mapping));
    setValue('cst_type', newType, { shouldValidate: true });
    setValue('alias', generateAlias(newType, schema), { shouldValidate: true });
  }

  function onChangePrototype(newPrototype: IConstituenta) {
    setPrototype(newPrototype);
    setArguments(
      newPrototype.parse!.args.map(arg => ({
        alias: arg.alias,
        typification: arg.typification,
        value: ''
      }))
    );
    setValue('cst_type', newPrototype.cst_type, { shouldValidate: true });
    setValue('alias', generateAlias(newPrototype.cst_type, schema), { shouldValidate: true });
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
