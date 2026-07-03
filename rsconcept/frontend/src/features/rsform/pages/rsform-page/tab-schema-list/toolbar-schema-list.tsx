'use client';

import { useTx } from '@/i18n';
import { CstType } from '@rsconcept/domain/library/rsform';

import { useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';

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
import { prepareTooltip } from '@/utils/format';

import { IconCstType } from '../../../components/icon-cst-type';
import { getCstTypeShortcut, labelCstType } from '../../../labels';
import { useSchemaEdit } from '../schema-edit-context';

interface ToolbarSchemaListProps {
  className?: string;
  onDeselectAll?: () => void;
}

export function ToolbarSchemaList({ className, onDeselectAll }: ToolbarSchemaListProps) {
  const tx = useTx();
  const router = useConceptNavigation();
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

  return (
    <div className={cn('cc-icons items-start outline-hidden', className)}>
      {schema.oss.length > 0 ? (
        <MiniSelectorOSS
          items={schema.oss}
          onSelect={(event, value) => router.gotoOss(value.id, event.ctrlKey || event.metaKey)}
        />
      ) : null}
      <MiniButton
        title={prepareTooltip(tx('tx.general.selection.reset'), 'ESC')}
        aria-label={tx('tx.general.selection.reset')}
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={onDeselectAll ?? deselectAll}
        disabled={selectedCst.length === 0}
      />
      <MiniButton
        title={prepareTooltip(tx('tx.general.moveUp'), 'Alt + ↑')}
        aria-label={tx('tx.general.moveUp')}
        icon={<IconMoveUp size='1.25rem' className='icon-primary' />}
        onClick={moveUp}
        disabled={isProcessing || selectedCst.length === 0 || selectedCst.length === schema.items.length}
      />
      <MiniButton
        title={prepareTooltip(tx('tx.general.moveDown'), 'Alt + ↓')}
        aria-label={tx('tx.general.moveDown')}
        icon={<IconMoveDown size='1.25rem' className='icon-primary' />}
        onClick={moveDown}
        disabled={isProcessing || selectedCst.length === 0 || selectedCst.length === schema.items.length}
      />
      <MiniButton
        title={tx('tx.cst.crucial')}
        aria-label={tx('tx.cst.crucial.toggle')}
        icon={<IconCrucial size='1.25rem' className='icon-primary' />}
        onClick={toggleCrucial}
        disabled={isProcessing || selectedCst.length === 0}
      />
      <div ref={menuRef} onBlur={handleMenuBlur} className='relative hidden xs:block'>
        <MiniButton
          title={tx('tx.cst.create.clean')}
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
        title={prepareTooltip(tx('tx.cst.new'), 'Alt + `')}
        icon={<IconNewItem size='1.25rem' className='icon-green' />}
        onClick={() => void promptCreateCst()}
        className='hidden xs:block'
        disabled={isProcessing}
      />
      <MiniButton
        title={prepareTooltip(tx('tx.cst.clone'), 'Alt + V')}
        aria-label={tx('tx.cst.clone')}
        icon={<IconClone size='1.25rem' className='icon-green' />}
        onClick={() => void cloneCst()}
        disabled={isProcessing || selectedCst.length === 0}
      />
      <MiniButton
        title={prepareTooltip(tx('tx.general.selection.selected.delete'), 'Delete')}
        aria-label={tx('tx.general.selection.selected.delete')}
        icon={<IconDestroy size='1.25rem' className='icon-red' />}
        onClick={promptDeleteCst}
        disabled={isProcessing || !canDeleteSelected}
      />
      <BadgeHelp topic={HelpTopic.UI_SCHEMA_LIST} offset={5} />
    </div>
  );
}
