'use client';

import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import BadgeHelp from '@/components/info/BadgeHelp';
import RSInput from '@/components/RSInput';
import SelectSingle from '@/components/ui/SelectSingle';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import AnimateFade from '@/components/wrap/AnimateFade';
import { HelpTopic } from '@/models/miscellaneous';
import { CstType, ICstCreateData, IRSForm } from '@/models/rsform';
import { generateAlias, isBaseSet, isBasicConcept, isFunctional, validateNewAlias } from '@/models/rsformAPI';
import { PARAMETER } from '@/utils/constants';
import { labelCstType } from '@/utils/labels';
import { SelectorCstType } from '@/utils/selectors';

interface FormCreateCstProps {
  schema: IRSForm;
  state: ICstCreateData;

  partialUpdate: React.Dispatch<Partial<ICstCreateData>>;
  setValidated?: React.Dispatch<React.SetStateAction<boolean>>;
}

function FormCreateCst({ schema, state, partialUpdate, setValidated }: FormCreateCstProps) {
  const [forceComment, setForceComment] = useState(false);

  const isBasic = useMemo(() => isBasicConcept(state.cst_type), [state]);
  const isElementary = useMemo(() => isBaseSet(state.cst_type), [state]);
  const showConvention = useMemo(() => !!state.convention || forceComment || isBasic, [state, forceComment, isBasic]);

  useLayoutEffect(() => {
    setForceComment(false);
  }, [state.cst_type, partialUpdate, schema]);

  useLayoutEffect(() => {
    if (setValidated) {
      setValidated(validateNewAlias(state.alias, state.cst_type, schema));
    }
  }, [state.alias, state.cst_type, schema, setValidated]);

  const handleTypeChange = useCallback(
    (target: CstType) => partialUpdate({ cst_type: target, alias: generateAlias(target, schema) }),
    [partialUpdate, schema]
  );

  return (
    <AnimatePresence>
      <div key='dlg_cst_alias_picker' className='flex items-center self-center gap-3'>
        <SelectSingle
          id='dlg_cst_type'
          placeholder='Выберите тип'
          className='w-[16rem]'
          options={SelectorCstType}
          value={{ value: state.cst_type, label: labelCstType(state.cst_type) }}
          onChange={data => handleTypeChange(data?.value ?? CstType.BASE)}
        />
        <TextInput
          id='dlg_cst_alias'
          dense
          label='Имя'
          className='w-[7rem]'
          value={state.alias}
          onChange={event => partialUpdate({ alias: event.target.value })}
        />
        <BadgeHelp
          topic={HelpTopic.CC_CONSTITUENTA}
          offset={16}
          className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
        />
      </div>
      <TextArea
        key='dlg_cst_term'
        id='dlg_cst_term'
        fitContent
        spellCheck
        label='Термин'
        placeholder='Обозначение для текстовых определений'
        className='max-h-[3.6rem]'
        value={state.term_raw}
        onChange={event => partialUpdate({ term_raw: event.target.value })}
      />
      <AnimateFade key='dlg_cst_expression' hideContent={!state.definition_formal && isElementary}>
        <RSInput
          id='dlg_cst_expression'
          noTooltip
          label={
            state.cst_type === CstType.STRUCTURED
              ? 'Область определения'
              : isFunctional(state.cst_type)
              ? 'Определение функции'
              : 'Формальное определение'
          }
          placeholder={
            state.cst_type !== CstType.STRUCTURED ? 'Родоструктурное выражение' : 'Типизация родовой структуры'
          }
          value={state.definition_formal}
          onChange={value => partialUpdate({ definition_formal: value })}
          schema={schema}
        />
      </AnimateFade>
      <AnimateFade key='dlg_cst_definition' hideContent={!state.definition_raw && isElementary}>
        <TextArea
          id='dlg_cst_definition'
          spellCheck
          fitContent
          label='Текстовое определение'
          placeholder='Текстовая интерпретация формального выражения'
          className='max-h-[3.6rem]'
          value={state.definition_raw}
          onChange={event => partialUpdate({ definition_raw: event.target.value })}
        />
      </AnimateFade>
      {!showConvention ? (
        <button
          key='dlg_cst_show_comment'
          id='dlg_cst_show_comment'
          tabIndex={-1}
          type='button'
          className='self-start cc-label clr-text-url hover:underline'
          onClick={() => setForceComment(true)}
        >
          Добавить комментарий
        </button>
      ) : null}
      <AnimateFade hideContent={!showConvention}>
        <TextArea
          key='dlg_cst_convention'
          id='dlg_cst_convention'
          spellCheck
          fitContent
          label={isBasic ? 'Конвенция' : 'Комментарий'}
          placeholder={isBasic ? 'Договоренность об интерпретации' : 'Пояснение разработчика'}
          className='max-h-[5.4rem]'
          value={state.convention}
          onChange={event => partialUpdate({ convention: event.target.value })}
        />
      </AnimateFade>
    </AnimatePresence>
  );
}

export default FormCreateCst;
