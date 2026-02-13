'use client';

import { useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { type RSForm } from '@/features/rsform';
import { useRoleStore, UserRole } from '@/features/users';

import { MiniButton } from '@/components/control';
import { IconDestroy, IconSave, IconShare } from '@/components/icons';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { tooltipText } from '@/utils/labels';
import { isMac, prepareTooltip, sharePage } from '@/utils/utils';

import { AccessPolicy, type LibraryItem, LibraryItemType } from '../backend/types';
import { useMutatingLibrary } from '../backend/use-mutating-library';

import { IconShowSidebar } from './icon-show-sidebar';
import { MiniSelectorOSS } from './mini-selector-oss';

interface ToolbarItemCardProps {
  className?: string;
  isNarrow: boolean;
  onSubmit: () => void;
  isMutable: boolean;
  item: LibraryItem;
  deleteItem: () => void;
}

export function ToolbarItemCard({
  className,
  isNarrow,
  item,
  onSubmit,
  isMutable,
  deleteItem
}: ToolbarItemCardProps) {
  const role = useRoleStore(state => state.role);
  const router = useConceptNavigation();
  const isModified = useModificationStore(state => state.isModified);
  const isProcessing = useMutatingLibrary();
  const canSave = isModified && !isProcessing;

  const showRSFormStats = usePreferencesStore(state => state.showRSFormStats);
  const toggleShowRSFormStats = usePreferencesStore(state => state.toggleShowRSFormStats);
  const showRSModelStats = usePreferencesStore(state => state.showRSModelStats);
  const toggleShowRSModelStats = usePreferencesStore(state => state.toggleShowRSModelStats);
  const showOSSStats = usePreferencesStore(state => state.showOSSStats);
  const toggleShowOSSStats = usePreferencesStore(state => state.toggleShowOSSStats);

  const showValue =
    item.item_type === LibraryItemType.RSFORM ? showRSFormStats :
      item.item_type === LibraryItemType.RSMODEL ? showRSModelStats : showOSSStats;
  const toggleShow =
    item.item_type === LibraryItemType.RSFORM ? toggleShowRSFormStats :
      item.item_type === LibraryItemType.RSMODEL ? toggleShowRSModelStats : toggleShowOSSStats;

  const ossSelector = (() => {
    if (item.item_type !== LibraryItemType.RSFORM) {
      return null;
    }
    const rsSchema = item as RSForm;
    if (rsSchema.oss.length <= 0) {
      return null;
    }
    return (
      <MiniSelectorOSS
        items={rsSchema.oss}
        onSelect={(event, value) => router.gotoOss(value.id, event.ctrlKey || event.metaKey)}
      />
    );
  })();

  return (
    <div className={cn('cc-icons', className)}>
      {ossSelector}
      {isMutable || isModified ? (
        <MiniButton
          titleHtml={prepareTooltip('Сохранить изменения', isMac() ? 'Cmd + S' : 'Ctrl + S')}
          aria-label='Сохранить изменения'
          icon={<IconSave size='1.25rem' className='icon-primary' />}
          onClick={onSubmit}
          disabled={!canSave}
        />
      ) : null}
      <MiniButton
        titleHtml={tooltipText.shareItem(item.access_policy === AccessPolicy.PUBLIC)}
        aria-label='Поделиться'
        icon={<IconShare size='1.25rem' className='icon-primary' />}
        onClick={sharePage}
        disabled={item.access_policy !== AccessPolicy.PUBLIC}
      />
      {isMutable ? (
        <MiniButton
          title='Удалить'
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          onClick={deleteItem}
          disabled={!isMutable || isProcessing || role < UserRole.OWNER}
        />
      ) : null}

      <MiniButton
        title='Отображение статистики'
        icon={<IconShowSidebar value={showValue} isBottom={isNarrow} size='1.25rem' />}
        onClick={toggleShow}
      />
      <BadgeHelp topic={HelpTopic.UI_RS_CARD} offset={4} />
    </div>
  );
}
