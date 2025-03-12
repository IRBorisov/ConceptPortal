'use client';

import { MiniButton } from '@/components/control';
import { IconGraphInputs, IconGraphOutputs, IconReset } from '@/components/icons';
import { APP_COLORS } from '@/styling/colors';

import { useTermGraphStore } from '../../../stores/term-graph';
import { useRSEdit } from '../rsedit-context';

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
    <div className='flex items-center cc-icons'>
      <div className='w-31 mt-0.5 text-right select-none' style={{ color: APP_COLORS.fgPurple }}>
        <span>
          Фокус
          <b className='pr-1'> {focusCst.alias} </b>
        </span>
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
