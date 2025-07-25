'use client';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { useRestoreVersion } from '@/features/library/backend/use-restore-version';

import { MiniButton } from '@/components/control';
import { IconNewVersion, IconUpload, IconVersions } from '@/components/icons';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { promptText } from '@/utils/labels';
import { promptUnsaved } from '@/utils/utils';

import { useRSEdit } from '../rsedit-context';

interface ToolbarVersioningProps {
  blockReload?: boolean;
  className?: string;
}

export function ToolbarVersioning({ blockReload, className }: ToolbarVersioningProps) {
  const isModified = useModificationStore(state => state.isModified);
  const { restoreVersion: versionRestore } = useRestoreVersion();
  const { schema, isMutable, isContentEditable, navigateVersion, activeVersion, selected } = useRSEdit();

  const showCreateVersion = useDialogsStore(state => state.showCreateVersion);
  const showEditVersions = useDialogsStore(state => state.showEditVersions);

  function handleRestoreVersion() {
    if (schema.version === 'latest' || !window.confirm(promptText.restoreArchive)) {
      return;
    }
    void versionRestore({ versionID: schema.version }).then(() => navigateVersion());
  }

  function handleCreateVersion() {
    if (isModified && !promptUnsaved()) {
      return;
    }
    showCreateVersion({
      itemID: schema.id,
      versions: schema.versions,
      selected: selected,
      totalCount: schema.items.length,
      onCreate: newVersion => navigateVersion(newVersion)
    });
  }

  function handleEditVersions() {
    showEditVersions({
      itemID: schema.id,
      afterDelete: targetVersion => {
        if (targetVersion === activeVersion) navigateVersion();
      }
    });
  }

  return (
    <div className={cn('cc-icons', className)}>
      {isMutable ? (
        <>
          <MiniButton
            titleHtml={
              blockReload
                ? 'Невозможно откатить КС, <br>прикрепленную к операционной схеме'
                : !isContentEditable
                ? 'Откатить к версии'
                : 'Переключитесь на <br/>неактуальную версию'
            }
            aria-label='Откатить к выбранной версии'
            onClick={handleRestoreVersion}
            icon={<IconUpload size='1.25rem' className='icon-red' />}
            disabled={isContentEditable || blockReload}
          />
          <MiniButton
            titleHtml={isContentEditable ? 'Создать версию' : 'Переключитесь <br/>на актуальную версию'}
            aria-label={isContentEditable ? 'Создать версию' : 'Переключить на актуальную версию'}
            onClick={handleCreateVersion}
            icon={<IconNewVersion size='1.25rem' className='icon-green' />}
            disabled={!isContentEditable}
          />
          <MiniButton
            title={schema.versions.length === 0 ? 'Список версий пуст' : 'Редактировать версии'}
            onClick={handleEditVersions}
            icon={<IconVersions size='1.25rem' className='icon-primary' />}
            disabled={schema.versions.length === 0}
          />
        </>
      ) : null}
      <BadgeHelp topic={HelpTopic.VERSIONS} offset={4} />
    </div>
  );
}
