'use client';

import { urls, useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';
import { type IRSForm } from '@/features/rsform';
import { useRoleStore, UserRole } from '@/features/users';

import { MiniButton } from '@/components/Control';
import { IconDestroy, IconSave, IconShare } from '@/components/Icons';
import { useModificationStore } from '@/stores/modification';
import { tooltipText } from '@/utils/labels';
import { prepareTooltip, sharePage } from '@/utils/utils';

import { AccessPolicy, type ILibraryItem, LibraryItemType } from '../backend/types';
import { useMutatingLibrary } from '../backend/useMutatingLibrary';

import { MiniSelectorOSS } from './MiniSelectorOSS';

interface ToolbarItemCardProps {
  onSubmit: () => void;
  isMutable: boolean;
  schema: ILibraryItem;
  deleteSchema: () => void;
}

export function ToolbarItemCard({ schema, onSubmit, isMutable, deleteSchema }: ToolbarItemCardProps) {
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
        onSelect={(event, value) => router.push({ path: urls.oss(value.id), newTab: event.ctrlKey || event.metaKey })}
      />
    );
  })();

  return (
    <div className='cc-tab-tools cc-icons'>
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
      <BadgeHelp topic={HelpTopic.UI_RS_CARD} offset={4} />
    </div>
  );
}
