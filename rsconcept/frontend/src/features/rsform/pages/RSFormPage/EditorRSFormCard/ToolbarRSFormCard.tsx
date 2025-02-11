'use client';

import { Overlay } from '@/components/Container';
import { MiniButton } from '@/components/Control';
import { IconDestroy, IconSave, IconShare } from '@/components/Icons';
import { BadgeHelp } from '@/components/shared/BadgeHelp';
import { HelpTopic } from '@/features/help/models/helpTopic';
import { useMutatingLibrary } from '@/features/library/backend/useMutatingLibrary';
import { AccessPolicy, ILibraryItemEditor, LibraryItemType } from '@/features/library/models/library';
import { UserRole } from '@/features/users/models/user';
import { useModificationStore } from '@/stores/modification';
import { useRoleStore } from '@/stores/role';
import { PARAMETER } from '@/utils/constants';
import { tooltipText } from '@/utils/labels';
import { prepareTooltip } from '@/utils/utils';
import { sharePage } from '@/utils/utils';

import MiniSelectorOSS from '../../../components/MiniSelectorOSS';
import { IRSForm } from '../../../models/rsform';
import { IRSEditContext } from '../RSEditContext';

interface ToolbarRSFormCardProps {
  onSubmit: () => void;
  controller: ILibraryItemEditor;
}

function ToolbarRSFormCard({ controller, onSubmit }: ToolbarRSFormCardProps) {
  const role = useRoleStore(state => state.role);
  const { isModified } = useModificationStore();
  const isProcessing = useMutatingLibrary();
  const canSave = isModified && !isProcessing;

  const ossSelector = (() => {
    if (controller.schema.item_type !== LibraryItemType.RSFORM) {
      return null;
    }
    const schema = controller.schema as IRSForm;
    if (schema.oss.length <= 0) {
      return null;
    }
    return (
      <MiniSelectorOSS
        items={schema.oss}
        onSelect={(event, value) =>
          (controller as IRSEditContext).navigateOss(value.id, event.ctrlKey || event.metaKey)
        }
      />
    );
  })();

  return (
    <Overlay position='cc-tab-tools' className='cc-icons'>
      {ossSelector}
      {controller.isMutable || isModified ? (
        <MiniButton
          titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
          disabled={!canSave}
          icon={<IconSave size='1.25rem' className='icon-primary' />}
          onClick={onSubmit}
        />
      ) : null}
      <MiniButton
        titleHtml={tooltipText.shareItem(controller.schema.access_policy)}
        icon={<IconShare size='1.25rem' className='icon-primary' />}
        onClick={sharePage}
        disabled={controller.schema.access_policy !== AccessPolicy.PUBLIC}
      />
      {controller.isMutable ? (
        <MiniButton
          title='Удалить схему'
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          disabled={!controller.isMutable || isProcessing || role < UserRole.OWNER}
          onClick={controller.deleteSchema}
        />
      ) : null}
      <BadgeHelp topic={HelpTopic.UI_RS_CARD} offset={4} className={PARAMETER.TOOLTIP_WIDTH} />
    </Overlay>
  );
}

export default ToolbarRSFormCard;
