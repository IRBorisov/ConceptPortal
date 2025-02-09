'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { TextArea, TextInput } from '@/components/Input';
import BadgeHelp from '@/components/shared/BadgeHelp';
import { HelpTopic } from '@/features/help/models/helpTopic';
import { PARAMETER } from '@/utils/constants';

import { ICstCreateDTO } from '../../backend/api';
import RSInput from '../../components/RSInput';
import { SelectCstType } from '../../components/SelectCstType';
import { CstType, IRSForm } from '../../models/rsform';
import { generateAlias, isBaseSet, isBasicConcept, isFunctional, validateNewAlias } from '../../models/rsformAPI';

interface FormCreateCstProps {
  schema: IRSForm;
  state: ICstCreateDTO;

  partialUpdate: React.Dispatch<Partial<ICstCreateDTO>>;
  setValidated?: React.Dispatch<React.SetStateAction<boolean>>;
}

function FormCreateCst({ schema, state, partialUpdate, setValidated }: FormCreateCstProps) {
  const [forceComment, setForceComment] = useState(false);

  const isBasic = isBasicConcept(state.cst_type);
  const isElementary = isBaseSet(state.cst_type);
  const showConvention = !!state.convention || forceComment || isBasic;

  useEffect(() => {
    setForceComment(false);
  }, [state.cst_type, partialUpdate, schema]);

  useEffect(() => {
    if (setValidated) {
      setValidated(validateNewAlias(state.alias, state.cst_type, schema));
    }
  }, [state.alias, state.cst_type, schema, setValidated]);

  function handleTypeChange(target: CstType) {
    return partialUpdate({ cst_type: target, alias: generateAlias(target, schema) });
  }

  return (
    <>
      <div className='flex items-center self-center gap-3'>
        <SelectCstType id='dlg_cst_type' className='w-[16rem]' value={state.cst_type} onChange={handleTypeChange} />
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
        id='dlg_cst_term'
        fitContent
        spellCheck
        label='Термин'
        placeholder='Обозначение для текстовых определений'
        className='max-h-[3.6rem]'
        value={state.term_raw}
        onChange={event => partialUpdate({ term_raw: event.target.value })}
      />

      {!!state.definition_formal || !isElementary ? (
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
      ) : null}

      {!!state.definition_raw || !isElementary ? (
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
      ) : null}

      {!showConvention ? (
        <button
          id='dlg_cst_show_comment'
          tabIndex={-1}
          type='button'
          className='self-start cc-label text-sec-600 hover:underline'
          onClick={() => setForceComment(true)}
        >
          Добавить комментарий
        </button>
      ) : (
        <TextArea
          id='dlg_cst_convention'
          spellCheck
          fitContent
          label={isBasic ? 'Конвенция' : 'Комментарий'}
          placeholder={isBasic ? 'Договоренность об интерпретации' : 'Пояснение разработчика'}
          className='max-h-[5.4rem]'
          value={state.convention}
          onChange={event => partialUpdate({ convention: event.target.value })}
        />
      )}
    </>
  );
}

export default FormCreateCst;
