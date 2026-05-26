'use client';

import { useState } from 'react';

import { type ArgumentValue, type Constituenta } from '@rsconcept/domain/library';
import { generateAlias, inferTemplatedType } from '@rsconcept/domain/library/rsform-api';
import { TypeID } from '@rsconcept/domain/rslang';
import { type AliasMapping, substituteTemplateArgs } from '@rsconcept/domain/rslang/api';
import { labelType } from '@rsconcept/domain/rslang/labels';

import { useTemplates } from '@/features/library/backend/use-templates';

import { useDialogsStore } from '@/stores/dialogs';

import { type DlgCstTemplateProps } from './dlg-cst-template';
import { TemplateContext } from './template-context';

interface TemplateStateProps extends React.PropsWithChildren {
  onDefinitionFormalChange: (newValue: string) => void;
  onCstTypeChange: (newValue: Constituenta['cst_type']) => void;
  onAliasChange: (newValue: string) => void;
  onTermRawChange: (newValue: string) => void;
  onDefinitionRawChange: (newValue: string) => void;
}

export const TemplateState = ({
  children,
  onDefinitionFormalChange,
  onCstTypeChange,
  onAliasChange,
  onTermRawChange,
  onDefinitionRawChange
}: TemplateStateProps) => {
  const { schema } = useDialogsStore(state => state.props as DlgCstTemplateProps);
  const { templates } = useTemplates();

  const [templateID, setTemplateID] = useState<number | null>(templates.length > 0 ? templates[0].id : null);
  const [args, setArguments] = useState<ArgumentValue[]>([]);
  const [prototype, setPrototype] = useState<Constituenta | null>(null);
  const [filterCategory, setFilterCategory] = useState<Constituenta | null>(null);

  function onChangeArguments(newArgs: ArgumentValue[]) {
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

    onDefinitionFormalChange(substituteTemplateArgs(prototype.definition_formal, mapping));
    onCstTypeChange(newType);
    onAliasChange(generateAlias(newType, schema));
  }

  function onChangePrototype(newPrototype: Constituenta) {
    setPrototype(newPrototype);
    const effectiveType = newPrototype.effectiveType;
    if (!effectiveType) {
      setArguments([]);
    } else if (effectiveType.typeID === TypeID.function || effectiveType.typeID === TypeID.predicate) {
      setArguments(
        effectiveType.args.map(arg => ({
          alias: arg.alias,
          typification: labelType(arg.type),
          value: ''
        }))
      );
    } else {
      setArguments([]);
    }

    onCstTypeChange(newPrototype.cst_type);
    onAliasChange(generateAlias(newPrototype.cst_type, schema));
    onDefinitionFormalChange(newPrototype.definition_formal);
    onTermRawChange(newPrototype.term_raw);
    onDefinitionRawChange(newPrototype.definition_raw);
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
