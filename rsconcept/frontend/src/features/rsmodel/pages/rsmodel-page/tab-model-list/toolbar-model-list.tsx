'use client';

import { CstType } from '@/domain/library';
import { useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { IconCstType } from '@/features/rsform/components/icon-cst-type';
import { getCstTypeShortcut, labelCstType } from '@/features/rsform/labels';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconCalculateAll,
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
import { prepareTooltip } from '@/utils/format';

import { useModelEdit } from '../model-edit-context';

interface ToolbarModelListProps {
  className?: string;
}

export function ToolbarModelList({ className }: ToolbarModelListProps) {
  const tx = useTx();
  const { elementRef: menuRef, isOpen: isMenuOpen, toggle: toggleMenu, handleBlur: handleMenuBlur } = useDropdown();
  const {
    schema,
    selectedCst,
    isProcessing,
    deselectAll,
    createCst,
    promptCreateCst,
    cloneCst,
    canDeleteSelected,
    promptDeleteSelected: promptDeleteCst,
    moveUp,
    moveDown,
    toggleCrucial
  } = useSchemaEdit();
  const { engine } = useModelEdit();

  return (
    <div className={cn('cc-icons items-start outline-hidden', className)}>
      <MiniButton
        title={prepareTooltip(tx('ui.toolbar.clearSelection'), tx('ui.hotkey.esc'))}
        aria-label={tx('ui.toolbar.clearSelection')}
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={deselectAll}
        disabled={selectedCst.length === 0}
      />
      <MiniButton
        title={prepareTooltip(tx('ui.action.recalculateModel'), tx('ui.hotkey.altQ'))}
        aria-label={tx('ui.aria.recalculateAll')}
        icon={<IconCalculateAll size='1.25rem' className='icon-green' />}
        onClick={() => engine.recalculateAll()}
      />
      <MiniButton
        title={prepareTooltip(tx('ui.toolbar.moveUp'), tx('ui.hotkey.altUp'))}
        aria-label={tx('ui.toolbar.moveUp')}
        icon={<IconMoveUp size='1.25rem' className='icon-primary' />}
        onClick={moveUp}
        disabled={isProcessing || selectedCst.length === 0 || selectedCst.length === schema.items.length}
      />
      <MiniButton
        title={prepareTooltip(tx('ui.toolbar.moveDown'), tx('ui.hotkey.altDown'))}
        aria-label={tx('ui.toolbar.moveDown')}
        icon={<IconMoveDown size='1.25rem' className='icon-primary' />}
        onClick={moveDown}
        disabled={isProcessing || selectedCst.length === 0 || selectedCst.length === schema.items.length}
      />
      <MiniButton
        title={tx('ui.rsform.formEdit.crucialTitle')}
        aria-label={tx('ui.cst.crucialToggleAria')}
        icon={<IconCrucial size='1.25rem' className='icon-primary' />}
        onClick={toggleCrucial}
        disabled={isProcessing || selectedCst.length === 0}
      />
      <div ref={menuRef} onBlur={handleMenuBlur} className='relative hidden xs:block'>
        <MiniButton
          title={tx('ui.toolbar.addEmptyConstituenta')}
          hideTitle={isMenuOpen}
          icon={<IconOpenList size='1.25rem' className='icon-green' />}
          onClick={toggleMenu}
          disabled={isProcessing}
        />
        <Dropdown isOpen={isMenuOpen} className='-translate-x-1/2'>
          {Object.values(CstType).map(typeStr => (
            <DropdownButton
              key={`${prefixes.csttype_list}${typeStr}`}
              text={labelCstType(typeStr)}
              icon={<IconCstType value={typeStr} size='1.25rem' />}
              onClick={() => void createCst(typeStr)}
              title={getCstTypeShortcut(typeStr)}
            />
          ))}
        </Dropdown>
      </div>
      <MiniButton
        title={prepareTooltip(
          tx('ui.toolbar.addNewConstituenta'),
          tx('ui.hotkey.altGrave')
        )}
        aria-label={tx('ui.aria.addNewConstituenta')}
        icon={<IconNewItem size='1.25rem' className='icon-green' />}
        onClick={() => void promptCreateCst()}
        className='hidden xs:block'
        disabled={isProcessing}
      />
      <MiniButton
        title={prepareTooltip(tx('ui.hint.cloneConstituenta'), tx('ui.hotkey.altV'))}
        aria-label={tx('ui.aria.cloneConstituenta')}
        icon={<IconClone size='1.25rem' className='icon-green' />}
        onClick={() => void cloneCst()}
        disabled={isProcessing || selectedCst.length !== 1}
      />
      <MiniButton
        title={prepareTooltip(tx('ui.toolbar.deleteSelected'), tx('ui.hotkey.delete'))}
        aria-label={tx('ui.aria.deleteSelected')}
        icon={<IconDestroy size='1.25rem' className='icon-red' />}
        onClick={promptDeleteCst}
        disabled={isProcessing || !canDeleteSelected}
      />
      <BadgeHelp topic={HelpTopic.UI_MODEL_LIST} offset={5} />
    </div>
  );
}
