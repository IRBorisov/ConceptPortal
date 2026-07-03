'use client';

import { useTx } from '@/i18n';

import { useConceptNavigation, useUnsavedChanges } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { useRestoreVersion } from '@/features/library/backend/use-restore-version';
import { useLibraryDialogsStore } from '@/features/library/dialogs/library-dialog-store';

import { MiniButton } from '@/components/control';
import { IconNewVersion, IconUpload, IconVersions } from '@/components/icons';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';

import { useSchemaEdit } from '../schema-edit-context';

interface ToolbarVersioningProps {
  blockReload?: boolean;
  className?: string;
}

export function ToolbarVersioning({ blockReload, className }: ToolbarVersioningProps) {
  const tx = useTx();
  const router = useConceptNavigation();
  const { promptUnsaved } = useUnsavedChanges();
  const isModified = useModificationStore(state => state.isModified);
  const { restoreVersion: versionRestore } = useRestoreVersion();
  const { schema, isMutable, isContentEditable, activeVersion, selectedCst } = useSchemaEdit();

  const showCreateVersion = useLibraryDialogsStore(state => state.showCreateVersion);
  const showEditVersions = useLibraryDialogsStore(state => state.showEditVersions);

  function handleRestoreVersion() {
    if (schema.version === 'latest' || !window.confirm(tx('tx.lib.version.revert.confirm'))) {
      return;
    }
    void versionRestore({ versionID: schema.version }).then(() => router.gotoRSForm(schema.id));
  }

  async function handleCreateVersion() {
    if (isModified) {
      const outcome = await promptUnsaved();
      if (outcome === 'cancel') {
        return;
      }
    }
    showCreateVersion({
      itemID: schema.id,
      versions: schema.versions,
      selected: selectedCst,
      totalCount: schema.items.length,
      onCreate: newVersion => router.gotoRSForm(schema.id, newVersion)
    });
  }

  function handleEditVersions() {
    showEditVersions({
      itemID: schema.id,
      afterDelete: targetVersion => {
        if (targetVersion === activeVersion) router.gotoRSForm(schema.id);
      }
    });
  }

  return (
    <div className={cn('cc-icons', className)}>
      {isMutable ? (
        <>
          <MiniButton
            title={
              blockReload
                ? tx('tx.lib.version.revert.validate.oss')
                : !isContentEditable
                  ? tx('tx.lib.version.revert')
                  : tx('tx.lib.version.switch.stale')
            }
            aria-label={tx('tx.lib.version.revert.hint')}
            onClick={handleRestoreVersion}
            icon={<IconUpload size='1.25rem' className='icon-red' />}
            disabled={isContentEditable || blockReload}
          />
          <MiniButton
            title={isContentEditable ? tx('tx.lib.version.create') : tx('tx.lib.version.switch.latest')}
            aria-label={isContentEditable ? tx('tx.lib.version.create') : tx('tx.lib.version.switch.latest')}
            onClick={() => void handleCreateVersion()}
            icon={<IconNewVersion size='1.25rem' className='icon-green' />}
            disabled={!isContentEditable}
          />
          <MiniButton
            title={schema.versions.length === 0 ? tx('tx.list.empty') : tx('tx.lib.version.list.edit')}
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
