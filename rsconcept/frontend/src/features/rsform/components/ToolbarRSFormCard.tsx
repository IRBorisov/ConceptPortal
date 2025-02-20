'use client';

import { urls, useConceptNavigation } from '@/app';
import { BadgeHelp, HelpTopic } from '@/features/help';
import { AccessPolicy, LibraryItemType, MiniSelectorOSS, useMutatingLibrary } from '@/features/library';
import { ILibraryItem } from '@/features/library/backend/types';
import { useRoleStore, UserRole } from '@/features/users';

import { Overlay } from '@/components/Container';
import { MiniButton } from '@/components/Control';
import { IconDestroy, IconSave, IconShare } from '@/components/Icons';
import { useModificationStore } from '@/stores/modification';
import { PARAMETER } from '@/utils/constants';
import { tooltipText } from '@/utils/labels';
import { prepareTooltip, sharePage } from '@/utils/utils';

import { IRSForm } from '../models/rsform';

interface ToolbarRSFormCardProps {
  onSubmit: () => void;
  isMutable: boolean;
  schema: ILibraryItem;
  deleteSchema: () => void;
}

export function ToolbarRSFormCard({ schema, onSubmit, isMutable, deleteSchema }: ToolbarRSFormCardProps) {
  const role = useRoleStore(state => state.role);
  const router = useConceptNavigation();
  const { isModified } = useModificationStore();
  const isProcessing = useMutatingLibrary();
  const canSave = isModified && !isProcessing;

  const ossSelector = (() => {
    if (schema.item_type !== LibraryItemType.RSFORM) {
      return null;
    }
    const rsSchema = schema as IRSForm;
    if (rsSchema.oss.length <= 0) {
      return null;
    }
    return (
      <MiniSelectorOSS
        items={rsSchema.oss}
        onSelect={(event, value) => router.push(urls.oss(value.id), event.ctrlKey || event.metaKey)}
      />
    );
  })();

  return (
    <Overlay position='cc-tab-tools' className='cc-icons'>
      {ossSelector}
      {isMutable || isModified ? (
        <MiniButton
          titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
          disabled={!canSave}
          icon={<IconSave size='1.25rem' className='icon-primary' />}
          onClick={onSubmit}
        />
      ) : null}
      <MiniButton
        titleHtml={tooltipText.shareItem(schema.access_policy === AccessPolicy.PUBLIC)}
        icon={<IconShare size='1.25rem' className='icon-primary' />}
        onClick={sharePage}
        disabled={schema.access_policy !== AccessPolicy.PUBLIC}
      />
      {isMutable ? (
        <MiniButton
          title='Удалить схему'
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          disabled={!isMutable || isProcessing || role < UserRole.OWNER}
          onClick={deleteSchema}
        />
      ) : null}
      <BadgeHelp topic={HelpTopic.UI_RS_CARD} offset={4} className={PARAMETER.TOOLTIP_WIDTH} />
    </Overlay>
  );
}
