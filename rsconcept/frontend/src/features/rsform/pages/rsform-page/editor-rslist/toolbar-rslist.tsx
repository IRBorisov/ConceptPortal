'use client';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';
import { CstType } from '@/features/rsform/models/rsform';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconClone,
  IconCrucial,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconReset
} from '@/components/icons';
import { cn } from '@/components/utils';
import { prefixes } from '@/utils/constants';
import { prepareTooltip } from '@/utils/utils';

import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { useUpdateCrucial } from '../../../backend/use-update-crucial';
import { IconCstType } from '../../../components/icon-cst-type';
import { getCstTypeShortcut, labelCstType } from '../../../labels';
import { useRSEdit } from '../rsedit-context';

interface ToolbarRSListProps {
  className?: string;
}

export function ToolbarRSList({ className }: ToolbarRSListProps) {
  const isProcessing = useMutatingRSForm();
  const { updateCrucial } = useUpdateCrucial();
  const { elementRef: menuRef, isOpen: isMenuOpen, toggle: toggleMenu, handleBlur: handleMenuBlur } = useDropdown();
  const {
    schema,
    selectedCst,
    activeCst,
    navigateOss,
    deselectAll,
    createCst,
    promptCreateCst,
    cloneCst,
    canDeleteSelected,
    promptDeleteSelected: promptDeleteCst,
    moveUp,
    moveDown
  } = useRSEdit();

  function handleToggleCrucial() {
    if (!activeCst) {
      return;
    }
    void updateCrucial({
      itemID: schema.id,
      data: {
        target: selectedCst,
        value: !activeCst.crucial
      }
    });
  }

  return (
    <div className={cn('cc-icons items-start outline-hidden', className)}>
      {schema.oss.length > 0 ? (
        <MiniSelectorOSS
          items={schema.oss}
          onSelect={(event, value) => navigateOss(value.id, event.ctrlKey || event.metaKey)}
        />
      ) : null}
      <MiniButton
        titleHtml={prepareTooltip('Сбросить выделение', 'ESC')}
        aria-label='Сбросить выделение'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={deselectAll}
        disabled={selectedCst.length === 0}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вверх', 'Alt + вверх')}
        aria-label='Переместить вверх'
        icon={<IconMoveUp size='1.25rem' className='icon-primary' />}
        onClick={moveUp}
        disabled={isProcessing || selectedCst.length === 0 || selectedCst.length === schema.items.length}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вниз', 'Alt + вниз')}
        aria-label='Переместить вниз'
        icon={<IconMoveDown size='1.25rem' className='icon-primary' />}
        onClick={moveDown}
        disabled={isProcessing || selectedCst.length === 0 || selectedCst.length === schema.items.length}
      />
      <MiniButton
        title='Ключевая конституента'
        aria-label='Переключатель статуса ключевой конституенты'
        icon={<IconCrucial size='1.25rem' className='icon-primary' />}
        onClick={handleToggleCrucial}
        disabled={isProcessing || selectedCst.length === 0}
      />
      <div ref={menuRef} onBlur={handleMenuBlur} className='relative'>
        <MiniButton
          title='Добавить пустую конституенту'
          hideTitle={isMenuOpen}
          icon={<IconOpenList size='1.25rem' className='icon-green' />}
          onClick={toggleMenu}
          disabled={isProcessing}
        />
        <Dropdown isOpen={isMenuOpen} className='-translate-x-1/2'>
          {Object.values(CstType).map(typeStr => (
            <DropdownButton
              key={`${prefixes.csttype_list}${typeStr}`}
              text={labelCstType(typeStr as CstType)}
              icon={<IconCstType value={typeStr as CstType} size='1.25rem' />}
              onClick={() => void createCst(typeStr as CstType)}
              titleHtml={getCstTypeShortcut(typeStr as CstType)}
            />
          ))}
        </Dropdown>
      </div>
      <MiniButton
        titleHtml={prepareTooltip('Добавить новую конституенту...', 'Alt + `')}
        aria-label='Добавить новую конституенту'
        icon={<IconNewItem size='1.25rem' className='icon-green' />}
        onClick={() => void promptCreateCst()}
        disabled={isProcessing}
      />
      <MiniButton
        titleHtml={prepareTooltip('Клонировать конституенту', 'Alt + V')}
        aria-label='Клонировать конституенту'
        icon={<IconClone size='1.25rem' className='icon-green' />}
        onClick={() => void cloneCst()}
        disabled={isProcessing || selectedCst.length !== 1}
      />
      <MiniButton
        titleHtml={prepareTooltip('Удалить выбранные', 'Delete')}
        aria-label='Удалить выбранные'
        icon={<IconDestroy size='1.25rem' className='icon-red' />}
        onClick={promptDeleteCst}
        disabled={isProcessing || !canDeleteSelected}
      />
      <BadgeHelp topic={HelpTopic.UI_RS_LIST} offset={5} />
    </div>
  );
}
