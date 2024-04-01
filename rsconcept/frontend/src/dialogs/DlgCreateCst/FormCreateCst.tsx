'use client';

import { AnimatePresence } from 'framer-motion';
import { useLayoutEffect, useMemo, useState } from 'react';

import RSInput from '@/components/RSInput';
import SelectSingle from '@/components/ui/SelectSingle';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';
import { CstType, ICstCreateData, IRSForm } from '@/models/rsform';
import { generateAlias, isBaseSet, isBasicConcept, isFunctional, validateNewAlias } from '@/models/rsformAPI';
import { labelCstType } from '@/utils/labels';
import { SelectorCstType } from '@/utils/selectors';

interface FormCreateCstProps {
  schema: IRSForm;
  state: ICstCreateData;

  partialUpdate: React.Dispatch<Partial<ICstCreateData>>;
  setValidated: React.Dispatch<React.SetStateAction<boolean>>;
}

function FormCreateCst({ schema, state, partialUpdate, setValidated }: FormCreateCstProps) {
  const [forceComment, setForceComment] = useState(false);

  const isBasic = useMemo(() => isBasicConcept(state.cst_type), [state]);
  const isElementary = useMemo(() => isBaseSet(state.cst_type), [state]);
  const showConvention = useMemo(() => !!state.convention || forceComment || isBasic, [state, forceComment, isBasic]);

  useLayoutEffect(() => {
    partialUpdate({ alias: generateAlias(state.cst_type, schema) });
    setForceComment(false);
  }, [state.cst_type, partialUpdate, schema]);

  useLayoutEffect(() => {
    setValidated(validateNewAlias(state.alias, state.cst_type, schema));
  }, [state.alias, state.cst_type, schema, setValidated]);

  return (
    <AnimatePresence>
      <div className='flex self-center gap-6'>
        <SelectSingle
          id='dlg_cst_type'
          placeholder='Выберите тип'
          className='w-[15rem]'
          options={SelectorCstType}
          value={{ value: state.cst_type, label: labelCstType(state.cst_type) }}
          onChange={data => partialUpdate({ cst_type: data?.value ?? CstType.BASE })}
        />
        <TextInput
          id='dlg_cst_alias'
          dense
          label='Имя'
          className='w-[7rem]'
          value={state.alias}
          onChange={event => partialUpdate({ alias: event.target.value })}
        />
      </div>
      <TextArea
        id='dlg_cst_term'
        spellCheck
        label='Термин'
        placeholder='Обозначение, используемое в текстовых определениях'
        rows={2}
        value={state.term_raw}
        onChange={event => partialUpdate({ term_raw: event.target.value })}
      />
      <AnimateFade hideContent={!state.definition_formal && isElementary}>
        <RSInput
          id='dlg_cst_expression'
          label={
            state.cst_type === CstType.STRUCTURED
              ? 'Область определения'
              : isFunctional(state.cst_type)
              ? 'Определение функции'
              : 'Формальное определение'
          }
          placeholder={
            state.cst_type !== CstType.STRUCTURED
              ? 'Родоструктурное выражение'
              : 'Определение множества, которому принадлежат элементы родовой структуры'
          }
          value={state.definition_formal}
          onChange={value => partialUpdate({ definition_formal: value })}
        />
      </AnimateFade>
      <AnimateFade hideContent={!state.definition_raw && isElementary}>
        <TextArea
          id='dlg_cst_definition'
          spellCheck
          label='Текстовое определение'
          placeholder='Текстовая интерпретация формального выражения'
          rows={2}
          value={state.definition_raw}
          onChange={event => partialUpdate({ definition_raw: event.target.value })}
        />
      </AnimateFade>
      {!showConvention ? (
        <button
          type='button'
          className='self-start cc-label clr-text-url hover:underline'
          onClick={() => setForceComment(true)}
        >
          Добавить комментарий
        </button>
      ) : null}
      <AnimateFade hideContent={!showConvention}>
        <TextArea
          id='dlg_cst_convention'
          spellCheck
          label={isBasic ? 'Конвенция' : 'Комментарий'}
          placeholder={isBasic ? 'Договоренность об интерпретации' : 'Пояснение разработчика'}
          rows={2}
          value={state.convention}
          onChange={event => partialUpdate({ convention: event.target.value })}
        />
      </AnimateFade>
    </AnimatePresence>
  );
}

export default FormCreateCst;
