'use client';

import { BadgeHelp, HelpTopic } from '@/features/help';
import {
  AccessPolicy,
  ILibraryItemEditor,
  LibraryItemType,
  MiniSelectorOSS,
  useMutatingLibrary
} from '@/features/library';
import { useRoleStore, UserRole } from '@/features/users';

import { Overlay } from '@/components/Container';
import { MiniButton } from '@/components/Control';
import { IconDestroy, IconSave, IconShare } from '@/components/Icons';
import { useModificationStore } from '@/stores/modification';
import { PARAMETER } from '@/utils/constants';
import { tooltipText } from '@/utils/labels';
import { prepareTooltip, sharePage } from '@/utils/utils';

import { IRSForm } from '../models/rsform';
import { IRSEditContext } from '../pages/RSFormPage/RSEditContext';

interface ToolbarRSFormCardProps {
  onSubmit: () => void;
  controller: ILibraryItemEditor;
}

export function ToolbarRSFormCard({ controller, onSubmit }: ToolbarRSFormCardProps) {
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
        titleHtml={tooltipText.shareItem(controller.schema.access_policy === AccessPolicy.PUBLIC)}
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
