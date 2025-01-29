import { useMutatingRSForm } from '@/backend/rsform/useMutatingRSForm';
import { CstTypeIcon } from '@/components/DomainIcons';
import {
  IconClone,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOpenList,
  IconReset
} from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniSelectorOSS from '@/components/select/MiniSelectorOSS';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import useDropdown from '@/hooks/useDropdown';
import { HelpTopic } from '@/models/miscellaneous';
import { CstType } from '@/models/rsform';
import { prefixes } from '@/utils/constants';
import { getCstTypeShortcut, labelCstType, prepareTooltip } from '@/utils/labels';

import { useRSEdit } from '../RSEditContext';

function ToolbarRSList() {
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
        onClick={() => controller.createCst(undefined, false)}
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

export default ToolbarRSList;
