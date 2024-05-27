import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { IconEdit } from '@/components/Icons';
import InfoUsers from '@/components/info/InfoUsers';
import SelectUser from '@/components/select/SelectUser';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import Tooltip from '@/components/ui/Tooltip';
import { useAccessMode } from '@/context/AccessModeContext';
import { useUsers } from '@/context/UsersContext';
import useDropdown from '@/hooks/useDropdown';
import { ILibraryItemEx } from '@/models/library';
import { UserID, UserLevel } from '@/models/user';
import { prefixes } from '@/utils/constants';

import LabeledValue from '../../../components/ui/LabeledValue';
import { useRSEdit } from '../RSEditContext';

interface EditorLibraryItemProps {
  item?: ILibraryItemEx;
  isModified?: boolean;
}

function EditorLibraryItem({ item, isModified }: EditorLibraryItemProps) {
  const { getUserLabel, users } = useUsers();
  const controller = useRSEdit();
  const { accessLevel } = useAccessMode();
  const intl = useIntl();

  const ownerSelector = useDropdown();
  const onSelectUser = useCallback(
    (newValue: UserID) => {
      console.log(newValue);
      ownerSelector.hide();
      if (newValue === item?.owner) {
        return;
      }
      controller.setOwner(newValue);
    },
    [controller, item?.owner, ownerSelector]
  );

  return (
    <div className='flex flex-col'>
      {accessLevel >= UserLevel.OWNER ? (
        <Overlay position='top-[-0.5rem] left-[6rem] cc-icons'>
          <div className='flex items-start'>
            <MiniButton
              title='Изменить владельца'
              noHover
              onClick={() => ownerSelector.toggle()}
              icon={<IconEdit size='1rem' className='mt-1 icon-primary' />}
              disabled={isModified || controller.isProcessing}
            />
            {ownerSelector.isOpen ? (
              <SelectUser
                className='w-[20rem] sm:w-[22.5rem] text-sm'
                items={users}
                value={item?.owner ?? undefined}
                onSelectValue={onSelectUser}
              />
            ) : null}
          </div>
        </Overlay>
      ) : null}
      <LabeledValue className='sm:mb-1' label='Владелец' text={getUserLabel(item?.owner ?? null)} />

      {accessLevel >= UserLevel.OWNER ? (
        <Overlay position='top-[-0.5rem] left-[6rem] cc-icons'>
          <div className='flex items-start'>
            <MiniButton
              title='Изменить редакторов'
              noHover
              onClick={() => controller.promptEditors()}
              icon={<IconEdit size='1rem' className='mt-1 icon-primary' />}
              disabled={isModified || controller.isProcessing}
            />
          </div>
        </Overlay>
      ) : null}
      <LabeledValue id='editor_stats' className='sm:mb-1' label='Редакторы' text={item?.editors.length ?? 0} />
      <Tooltip anchorSelect='#editor_stats' layer='z-modal-tooltip'>
        <InfoUsers items={item?.editors ?? []} prefix={prefixes.user_editors} />
      </Tooltip>

      <LabeledValue id='sub_stats' className='sm:mb-1' label='Отслеживают' text={item?.subscribers.length ?? 0} />
      <Tooltip anchorSelect='#sub_stats' layer='z-modal-tooltip'>
        <InfoUsers items={item?.subscribers ?? []} prefix={prefixes.user_subs} />
      </Tooltip>

      <LabeledValue
        className='sm:mb-1'
        label='Дата обновления'
        text={item ? new Date(item?.time_update).toLocaleString(intl.locale) : ''}
      />
      <LabeledValue label='Дата создания' text={item ? new Date(item?.time_create).toLocaleString(intl.locale) : ''} />
    </div>
  );
}

export default EditorLibraryItem;
