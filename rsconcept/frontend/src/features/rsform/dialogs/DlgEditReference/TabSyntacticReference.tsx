'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { TextInput } from '@/components/Input';
import { useDialogsStore } from '@/stores/dialogs';

import { type DlgEditReferenceProps, type IEditReferenceState } from './DlgEditReference';

export function TabSyntacticReference() {
  const { initial } = useDialogsStore(state => state.props as DlgEditReferenceProps);
  const { control, register } = useFormContext<IEditReferenceState>();
  const offset = useWatch({ control, name: 'syntactic.offset' });

  const mainLink = (() => {
    const position = offset > 0 ? initial.basePosition + (offset - 1) : initial.basePosition + offset;
    if (offset === 0 || position < 0 || position >= initial.mainRefs.length) {
      return 'Некорректное значение смещения';
    } else {
      return initial.mainRefs[position];
    }
  })();

  return (
    <div className='cc-fade-in flex flex-col gap-2'>
      <TextInput
        id='dlg_reference_offset'
        type='number'
        dense
        label='Смещение'
        className='max-w-40'
        {...register('syntactic.offset')}
      />
      <TextInput
        id='dlg_main_ref'
        disabled //
        dense
        noBorder
        label='Основная ссылка'
        value={mainLink}
      />
      <TextInput
        id='dlg_reference_nominal'
        spellCheck
        label='Начальная форма'
        placeholder='зависимое слово в начальной форме'
        {...register('syntactic.nominal')}
      />
    </div>
  );
}
