'use client';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';
import { useVersionRestore } from '@/features/library/backend/useVersionRestore';

import { MiniButton } from '@/components/Control';
import { IconNewVersion, IconUpload, IconVersions } from '@/components/Icons';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { promptText } from '@/utils/labels';
import { promptUnsaved } from '@/utils/utils';

import { useRSEdit } from '../RSEditContext';

interface ToolbarVersioningProps {
  blockReload?: boolean;
}

export function ToolbarVersioning({ blockReload }: ToolbarVersioningProps) {
  const { isModified } = useModificationStore();
  const { versionRestore } = useVersionRestore();
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
    <div className='absolute z-bottom top-[-0.4rem] right-[0rem] pr-2 cc-icons'>
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
            disabled={isContentEditable || blockReload}
            onClick={handleRestoreVersion}
            icon={<IconUpload size='1.25rem' className='icon-red' />}
          />
          <MiniButton
            titleHtml={isContentEditable ? 'Создать версию' : 'Переключитесь <br/>на актуальную версию'}
            disabled={!isContentEditable}
            onClick={handleCreateVersion}
            icon={<IconNewVersion size='1.25rem' className='icon-green' />}
          />
          <MiniButton
            title={schema.versions.length === 0 ? 'Список версий пуст' : 'Редактировать версии'}
            disabled={schema.versions.length === 0}
            onClick={handleEditVersions}
            icon={<IconVersions size='1.25rem' className='icon-primary' />}
          />
        </>
      ) : null}
      <BadgeHelp topic={HelpTopic.VERSIONS} offset={4} />
    </div>
  );
}
