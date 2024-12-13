'use client';

import { IconDestroy, IconSave, IconShare } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniSelectorOSS from '@/components/select/MiniSelectorOSS';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { useAccessMode } from '@/context/AccessModeContext';
import { AccessPolicy, ILibraryItemEditor, LibraryItemType } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { IRSForm } from '@/models/rsform';
import { UserLevel } from '@/models/user';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip, tooltips } from '@/utils/labels';

import { IRSEditContext } from '../RSEditContext';

interface ToolbarRSFormCardProps {
  modified: boolean;
  onSubmit: () => void;
  onDestroy: () => void;
  controller: ILibraryItemEditor;
}

function ToolbarRSFormCard({ modified, controller, onSubmit, onDestroy }: ToolbarRSFormCardProps) {
  const { accessLevel } = useAccessMode();
  const canSave = modified && !controller.isProcessing;

  const ossSelector = (() => {
    if (!controller.schema || controller.schema?.item_type !== LibraryItemType.RSFORM) {
      return null;
    }
    const schema = controller.schema as IRSForm;
    if (schema.oss.length <= 0) {
      return null;
    }
    return (
      <MiniSelectorOSS
        items={schema.oss}
        onSelect={(event, value) => (controller as IRSEditContext).viewOSS(value.id, event.ctrlKey || event.metaKey)}
      />
    );
  })();

  return (
    <Overlay position='cc-tab-tools' className='cc-icons'>
      {ossSelector}
      {controller.isMutable || modified ? (
        <MiniButton
          titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
          disabled={!canSave}
          icon={<IconSave size='1.25rem' className='icon-primary' />}
          onClick={onSubmit}
        />
      ) : null}
      <MiniButton
        titleHtml={tooltips.shareItem(controller.schema?.access_policy)}
        icon={<IconShare size='1.25rem' className='icon-primary' />}
        onClick={controller.share}
        disabled={controller.schema?.access_policy !== AccessPolicy.PUBLIC}
      />
      {controller.isMutable ? (
        <MiniButton
          title='Удалить схему'
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          disabled={!controller.isMutable || controller.isProcessing || accessLevel < UserLevel.OWNER}
          onClick={onDestroy}
        />
      ) : null}
      <BadgeHelp topic={HelpTopic.UI_RS_CARD} offset={4} className={PARAMETER.TOOLTIP_WIDTH} />
    </Overlay>
  );
}

export default ToolbarRSFormCard;
