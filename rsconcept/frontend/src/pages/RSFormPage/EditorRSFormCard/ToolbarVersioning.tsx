'use client';

import { useVersionCreate } from '@/backend/library/useVersionCreate';
import { useVersionRestore } from '@/backend/library/useVersionRestore';
import { IconNewVersion, IconUpload, IconVersions } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { HelpTopic } from '@/models/miscellaneous';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { PARAMETER } from '@/utils/constants';
import { prompts } from '@/utils/labels';
import { promptUnsaved } from '@/utils/utils';

import { useRSEdit } from '../RSEditContext';

interface ToolbarVersioningProps {
  blockReload?: boolean;
}

function ToolbarVersioning({ blockReload }: ToolbarVersioningProps) {
  const controller = useRSEdit();
  const { isModified } = useModificationStore();
  const { versionRestore } = useVersionRestore();
  const { versionCreate } = useVersionCreate();

  const showCreateVersion = useDialogsStore(state => state.showCreateVersion);
  const showEditVersions = useDialogsStore(state => state.showEditVersions);

  function handleRestoreVersion() {
    if (!controller.schema.version || !window.confirm(prompts.restoreArchive)) {
      return;
    }
    versionRestore({ versionID: controller.schema.version }, () => controller.navigateVersion(undefined));
  }

  function handleCreateVersion() {
    if (isModified && !promptUnsaved()) {
      return;
    }
    showCreateVersion({
      versions: controller.schema.versions,
      selected: controller.selected,
      totalCount: controller.schema.items.length,
      onCreate: data =>
        versionCreate(
          {
            itemID: controller.schema.id, //
            data: data
          },
          newVersion => controller.navigateVersion(newVersion)
        )
    });
  }

  function handleEditVersions() {
    showEditVersions({
      item: controller.schema,
      afterDelete: targetVersion => {
        if (targetVersion === controller.activeVersion) controller.navigateVersion(undefined);
      }
    });
  }

  return (
    <Overlay position='top-[-0.4rem] right-[0rem]' className='pr-2 cc-icons' layer='z-bottom'>
      {controller.isMutable ? (
        <>
          <MiniButton
            titleHtml={
              blockReload
                ? 'Невозможно откатить КС, <br>прикрепленную к операционной схеме'
                : !controller.isContentEditable
                ? 'Откатить к версии'
                : 'Переключитесь на <br/>неактуальную версию'
            }
            disabled={controller.isContentEditable || blockReload}
            onClick={handleRestoreVersion}
            icon={<IconUpload size='1.25rem' className='icon-red' />}
          />
          <MiniButton
            titleHtml={controller.isContentEditable ? 'Создать версию' : 'Переключитесь <br/>на актуальную версию'}
            disabled={!controller.isContentEditable}
            onClick={handleCreateVersion}
            icon={<IconNewVersion size='1.25rem' className='icon-green' />}
          />
          <MiniButton
            title={controller.schema.versions.length === 0 ? 'Список версий пуст' : 'Редактировать версии'}
            disabled={controller.schema.versions.length === 0}
            onClick={handleEditVersions}
            icon={<IconVersions size='1.25rem' className='icon-primary' />}
          />
        </>
      ) : null}
      <BadgeHelp topic={HelpTopic.VERSIONS} className={PARAMETER.TOOLTIP_WIDTH} offset={4} />
    </Overlay>
  );
}

export default ToolbarVersioning;
