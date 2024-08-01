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
import { getCstTypePrefix } from '@/models/rsformAPI';
import { prefixes } from '@/utils/constants';
import { getCstTypeShortcut, labelCstType, prepareTooltip } from '@/utils/labels';

import { useRSEdit } from '../RSEditContext';

function ToolbarRSList() {
  const controller = useRSEdit();
  const insertMenu = useDropdown();

  return (
    <Overlay position='top-1 right-1/2 translate-x-1/2' className='items-start cc-icons'>
      {controller.schema && controller.schema?.oss.length > 0 ? (
        <MiniSelectorOSS
          items={controller.schema.oss}
          onSelect={(event, value) => controller.viewOSS(value.id, event.ctrlKey || event.metaKey)}
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
        disabled={controller.isProcessing || controller.nothingSelected}
        onClick={controller.moveUp}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вниз', 'Alt + вниз')}
        icon={<IconMoveDown size='1.25rem' className='icon-primary' />}
        disabled={controller.isProcessing || controller.nothingSelected}
        onClick={controller.moveDown}
      />
      <MiniButton
        titleHtml={prepareTooltip('Клонировать конституенту', 'Alt + V')}
        icon={<IconClone size='1.25rem' className='icon-green' />}
        disabled={controller.isProcessing || controller.selected.length !== 1}
        onClick={controller.cloneCst}
      />
      <MiniButton
        titleHtml={prepareTooltip('Добавить новую конституенту...', 'Alt + `')}
        icon={<IconNewItem size='1.25rem' className='icon-green' />}
        disabled={controller.isProcessing}
        onClick={() => controller.createCst(undefined, false)}
      />
      <div ref={insertMenu.ref}>
        <MiniButton
          title='Добавить пустую конституенту'
          hideTitle={insertMenu.isOpen}
          icon={<IconOpenList size='1.25rem' className='icon-green' />}
          disabled={controller.isProcessing}
          onClick={insertMenu.toggle}
        />
        <Dropdown isOpen={insertMenu.isOpen}>
          {Object.values(CstType).map(typeStr => (
            <DropdownButton
              key={`${prefixes.csttype_list}${typeStr}`}
              text={`${getCstTypePrefix(typeStr as CstType)}1 — ${labelCstType(typeStr as CstType)}`}
              onClick={() => controller.createCst(typeStr as CstType, true)}
              titleHtml={getCstTypeShortcut(typeStr as CstType)}
            />
          ))}
        </Dropdown>
      </div>
      <MiniButton
        titleHtml={prepareTooltip('Удалить выбранные', 'Delete')}
        icon={<IconDestroy size='1.25rem' className='icon-red' />}
        disabled={controller.isProcessing || !controller.canDeleteSelected}
        onClick={controller.promptDeleteCst}
      />
      <BadgeHelp topic={HelpTopic.UI_RS_LIST} offset={5} />
    </Overlay>
  );
}

export default ToolbarRSList;
