import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { IconDateCreate, IconDateUpdate, IconEditor, IconFolder, IconOwner } from '@/components/Icons';
import InfoUsers from '@/components/info/InfoUsers';
import SelectUser from '@/components/select/SelectUser';
import IconValue from '@/components/ui/IconValue';
import Overlay from '@/components/ui/Overlay';
import Tooltip from '@/components/ui/Tooltip';
import { useAccessMode } from '@/context/AccessModeContext';
import { useUsers } from '@/context/UsersContext';
import useDropdown from '@/hooks/useDropdown';
import { ILibraryItemData, ILibraryItemEditor } from '@/models/library';
import { UserID, UserLevel } from '@/models/user';
import { prefixes } from '@/utils/constants';
import { prompts } from '@/utils/labels';

interface EditorLibraryItemProps {
  item?: ILibraryItemData;
  isModified?: boolean;
  controller: ILibraryItemEditor;
}

function EditorLibraryItem({ item, isModified, controller }: EditorLibraryItemProps) {
  const { getUserLabel, users } = useUsers();
  const { accessLevel } = useAccessMode();
  const intl = useIntl();

  const ownerSelector = useDropdown();
  const onSelectUser = useCallback(
    (newValue: UserID) => {
      ownerSelector.hide();
      if (newValue === item?.owner) {
        return;
      }
      if (!window.confirm(prompts.ownerChange)) {
        return;
      }
      controller.setOwner(newValue);
    },
    [controller, item?.owner, ownerSelector]
  );

  if (!item) {
    return null;
  }

  return (
    <div className='flex flex-col'>
      <IconValue
        className='sm:mb-1 text-ellipsis max-w-[30rem]'
        icon={<IconFolder size='1.25rem' className='icon-primary' />}
        value={item.location}
        title={controller.isAttachedToOSS ? 'Путь наследуется от ОСС' : 'Путь'}
        onClick={controller.promptLocation}
        disabled={isModified || controller.isProcessing || controller.isAttachedToOSS || accessLevel < UserLevel.OWNER}
      />

      {ownerSelector.isOpen ? (
        <Overlay position='top-[-0.5rem] left-[2.5rem] cc-icons'>
          {ownerSelector.isOpen ? (
            <SelectUser
              className='w-[26.5rem] sm:w-[27.5rem] text-sm'
              items={users}
              value={item.owner ?? undefined}
              onSelectValue={onSelectUser}
            />
          ) : null}
        </Overlay>
      ) : null}
      <IconValue
        className='sm:mb-1'
        icon={<IconOwner size='1.25rem' className='icon-primary' />}
        value={getUserLabel(item.owner)}
        title={controller.isAttachedToOSS ? 'Владелец наследуется от ОСС' : 'Владелец'}
        onClick={ownerSelector.toggle}
        disabled={isModified || controller.isProcessing || controller.isAttachedToOSS || accessLevel < UserLevel.OWNER}
      />

      <div className='sm:mb-1 flex justify-between items-center'>
        <IconValue
          id='editor_stats'
          dense
          icon={<IconEditor size='1.25rem' className='icon-primary' />}
          value={item.editors.length}
          onClick={controller.promptEditors}
          disabled={isModified || controller.isProcessing || accessLevel < UserLevel.OWNER}
        />
        <Tooltip anchorSelect='#editor_stats' layer='z-modalTooltip'>
          <InfoUsers items={item?.editors ?? []} prefix={prefixes.user_editors} />
        </Tooltip>

        <IconValue
          dense
          disabled
          icon={<IconDateUpdate size='1.25rem' className='clr-text-green' />}
          value={new Date(item.time_update).toLocaleString(intl.locale)}
          title='Дата обновления'
        />

        <IconValue
          dense
          disabled
          icon={<IconDateCreate size='1.25rem' className='clr-text-green' />}
          value={new Date(item.time_create).toLocaleString(intl.locale, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
          })}
          title='Дата создания'
        />
      </div>
    </div>
  );
}

export default EditorLibraryItem;
