import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';
import { MiniSelectorOSS } from '@/features/library/components';
import { CstType } from '@/features/rsform';

import { MiniButton } from '@/components/control1';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown1';
import {
  IconClone,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconReset
} from '@/components/icons1';
import { prefixes } from '@/utils/constants';
import { prepareTooltip } from '@/utils/utils';

import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { IconCstType } from '../../../components/icon-cst-type';
import { getCstTypeShortcut, labelCstType } from '../../../labels';
import { useRSEdit } from '../rsedit-context';

interface ToolbarRSListProps {
  className?: string;
}

export function ToolbarRSList({ className }: ToolbarRSListProps) {
  const isProcessing = useMutatingRSForm();
  const insertMenu = useDropdown();
  const {
    schema,
    selected,
    navigateOss,
    deselectAll,
    createCst,
    createCstDefault,
    cloneCst,
    canDeleteSelected,
    promptDeleteCst,
    moveUp,
    moveDown
  } = useRSEdit();

  return (
    <div className={clsx('cc-icons items-start outline-hidden', className)}>
      {schema.oss.length > 0 ? (
        <MiniSelectorOSS
          items={schema.oss}
          onSelect={(event, value) => navigateOss(value.id, event.ctrlKey || event.metaKey)}
        />
      ) : null}
      <MiniButton
        titleHtml={prepareTooltip('Сбросить выделение', 'ESC')}
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        disabled={selected.length === 0}
        onClick={deselectAll}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вверх', 'Alt + вверх')}
        icon={<IconMoveUp size='1.25rem' className='icon-primary' />}
        disabled={isProcessing || selected.length === 0 || selected.length === schema.items.length}
        onClick={moveUp}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вниз', 'Alt + вниз')}
        icon={<IconMoveDown size='1.25rem' className='icon-primary' />}
        disabled={isProcessing || selected.length === 0 || selected.length === schema.items.length}
        onClick={moveDown}
      />
      <div ref={insertMenu.ref} className='relative'>
        <MiniButton
          title='Добавить пустую конституенту'
          hideTitle={insertMenu.isOpen}
          icon={<IconOpenList size='1.25rem' className='icon-green' />}
          disabled={isProcessing}
          onClick={insertMenu.toggle}
        />
        <Dropdown isOpen={insertMenu.isOpen} className='-translate-x-1/2'>
          {Object.values(CstType).map(typeStr => (
            <DropdownButton
              key={`${prefixes.csttype_list}${typeStr}`}
              text={labelCstType(typeStr as CstType)}
              icon={<IconCstType value={typeStr as CstType} size='1.25rem' />}
              onClick={() => createCst(typeStr as CstType, true)}
              titleHtml={getCstTypeShortcut(typeStr as CstType)}
            />
          ))}
        </Dropdown>
      </div>
      <MiniButton
        titleHtml={prepareTooltip('Добавить новую конституенту...', 'Alt + `')}
        icon={<IconNewItem size='1.25rem' className='icon-green' />}
        disabled={isProcessing}
        onClick={createCstDefault}
      />
      <MiniButton
        titleHtml={prepareTooltip('Клонировать конституенту', 'Alt + V')}
        icon={<IconClone size='1.25rem' className='icon-green' />}
        disabled={isProcessing || selected.length !== 1}
        onClick={cloneCst}
      />
      <MiniButton
        titleHtml={prepareTooltip('Удалить выбранные', 'Delete')}
        icon={<IconDestroy size='1.25rem' className='icon-red' />}
        disabled={isProcessing || !canDeleteSelected}
        onClick={promptDeleteCst}
      />
      <BadgeHelp topic={HelpTopic.UI_RS_LIST} offset={5} />
    </div>
  );
}
