'use client';

import { useTermGraphStore } from '@/features/rsform/stores/termGraph';

import { MiniButton } from '@/components/Control';
import { IconGraphInputs, IconGraphOutputs, IconReset } from '@/components/Icons';
import { APP_COLORS } from '@/styling/colors';

import { useRSEdit } from '../RSEditContext';

export function ToolbarFocusedCst() {
  const { setFocus, focusCst } = useRSEdit();

  const filter = useTermGraphStore(state => state.filter);
  const setFilter = useTermGraphStore(state => state.setFilter);

  function resetSelection() {
    setFocus(null);
  }

  function handleShowInputs() {
    setFilter({
      ...filter,
      focusShowInputs: !filter.focusShowInputs
    });
  }

  function handleShowOutputs() {
    setFilter({
      ...filter,
      focusShowOutputs: !filter.focusShowOutputs
    });
  }

  if (!focusCst) {
    return null;
  }

  return (
    <div className='items-center cc-icons'>
      <div className='w-[7.8rem] text-right select-none' style={{ color: APP_COLORS.fgPurple }}>
        Фокус
        <b className='px-1'> {focusCst.alias} </b>
      </div>
      <MiniButton
        titleHtml='Сбросить фокус'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={resetSelection}
      />
      <MiniButton
        title={filter.focusShowInputs ? 'Скрыть поставщиков' : 'Отобразить поставщиков'}
        icon={<IconGraphInputs size='1.25rem' className={filter.focusShowInputs ? 'icon-green' : 'icon-primary'} />}
        onClick={handleShowInputs}
      />
      <MiniButton
        title={filter.focusShowOutputs ? 'Скрыть потребителей' : 'Отобразить потребителей'}
        icon={<IconGraphOutputs size='1.25rem' className={filter.focusShowOutputs ? 'icon-green' : 'icon-primary'} />}
        onClick={handleShowOutputs}
      />
    </div>
  );
}
