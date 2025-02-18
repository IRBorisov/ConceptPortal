import { BadgeHelp, HelpTopic } from '@/features/help';
import { MiniSelectorOSS } from '@/features/library';
import { CstType } from '@/features/rsform';

import { Overlay } from '@/components/Container';
import { MiniButton } from '@/components/Control';
import { DomIconProps } from '@/components/DomainIcons';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import {
  IconClone,
  IconCstAxiom,
  IconCstBaseSet,
  IconCstConstSet,
  IconCstFunction,
  IconCstPredicate,
  IconCstStructured,
  IconCstTerm,
  IconCstTheorem,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconReset
} from '@/components/Icons';
import { prefixes } from '@/utils/constants';
import { prepareTooltip } from '@/utils/utils';

import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import { getCstTypeShortcut, labelCstType } from '../../../labels';
import { useRSEdit } from '../RSEditContext';

export function ToolbarRSList() {
  const controller = useRSEdit();
  const isProcessing = useMutatingRSForm();
  const insertMenu = useDropdown();

  return (
    <Overlay
      position='cc-tab-tools right-4 translate-x-0 md:right-1/2 md:translate-x-1/2'
      className='cc-icons cc-animate-position items-start outline-none'
    >
      {controller.schema.oss.length > 0 ? (
        <MiniSelectorOSS
          items={controller.schema.oss}
          onSelect={(event, value) => controller.navigateOss(value.id, event.ctrlKey || event.metaKey)}
        />
      ) : null}
      <MiniButton
        titleHtml={prepareTooltip('Сбросить выделение', 'ESC')}
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        disabled={controller.selected.length === 0}
        onClick={controller.deselectAll}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вверх', 'Alt + вверх')}
        icon={<IconMoveUp size='1.25rem' className='icon-primary' />}
        disabled={
          isProcessing ||
          controller.selected.length === 0 ||
          controller.selected.length === controller.schema.items.length
        }
        onClick={controller.moveUp}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вниз', 'Alt + вниз')}
        icon={<IconMoveDown size='1.25rem' className='icon-primary' />}
        disabled={
          isProcessing ||
          controller.selected.length === 0 ||
          controller.selected.length === controller.schema.items.length
        }
        onClick={controller.moveDown}
      />
      <div ref={insertMenu.ref}>
        <MiniButton
          title='Добавить пустую конституенту'
          hideTitle={insertMenu.isOpen}
          icon={<IconOpenList size='1.25rem' className='icon-green' />}
          disabled={isProcessing}
          onClick={insertMenu.toggle}
        />
        <Dropdown isOpen={insertMenu.isOpen} className='-translate-x-1/2 md:translate-x-0'>
          {Object.values(CstType).map(typeStr => (
            <DropdownButton
              key={`${prefixes.csttype_list}${typeStr}`}
              text={labelCstType(typeStr as CstType)}
              icon={<CstTypeIcon value={typeStr as CstType} size='1.25rem' />}
              onClick={() => controller.createCst(typeStr as CstType, true)}
              titleHtml={getCstTypeShortcut(typeStr as CstType)}
            />
          ))}
        </Dropdown>
      </div>
      <MiniButton
        titleHtml={prepareTooltip('Добавить новую конституенту...', 'Alt + `')}
        icon={<IconNewItem size='1.25rem' className='icon-green' />}
        disabled={isProcessing}
        onClick={controller.createCstDefault}
      />
      <MiniButton
        titleHtml={prepareTooltip('Клонировать конституенту', 'Alt + V')}
        icon={<IconClone size='1.25rem' className='icon-green' />}
        disabled={isProcessing || controller.selected.length !== 1}
        onClick={controller.cloneCst}
      />
      <MiniButton
        titleHtml={prepareTooltip('Удалить выбранные', 'Delete')}
        icon={<IconDestroy size='1.25rem' className='icon-red' />}
        disabled={isProcessing || !controller.canDeleteSelected}
        onClick={controller.promptDeleteCst}
      />
      <BadgeHelp topic={HelpTopic.UI_RS_LIST} offset={5} />
    </Overlay>
  );
}

/** Icon for constituenta type. */
function CstTypeIcon({ value, size = '1.25rem', className }: DomIconProps<CstType>) {
  switch (value) {
    case CstType.BASE:
      return <IconCstBaseSet size={size} className={className ?? 'text-ok-600'} />;
    case CstType.CONSTANT:
      return <IconCstConstSet size={size} className={className ?? 'text-ok-600'} />;
    case CstType.STRUCTURED:
      return <IconCstStructured size={size} className={className ?? 'text-ok-600'} />;
    case CstType.TERM:
      return <IconCstTerm size={size} className={className ?? 'text-sec-600'} />;
    case CstType.AXIOM:
      return <IconCstAxiom size={size} className={className ?? 'text-warn-600'} />;
    case CstType.FUNCTION:
      return <IconCstFunction size={size} className={className ?? 'text-sec-600'} />;
    case CstType.PREDICATE:
      return <IconCstPredicate size={size} className={className ?? 'text-warn-600'} />;
    case CstType.THEOREM:
      return <IconCstTheorem size={size} className={className ?? 'text-warn-600'} />;
  }
}
