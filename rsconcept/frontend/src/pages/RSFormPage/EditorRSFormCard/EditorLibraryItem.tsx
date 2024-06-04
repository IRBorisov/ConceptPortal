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
import { ILibraryItemData, ILibraryItemEditor } from '@/models/library';
import { UserID, UserLevel } from '@/models/user';
import { prefixes } from '@/utils/constants';

import LabeledValue from '../../../components/ui/LabeledValue';

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
      if (
        !window.confirm(
          'Вы уверены, что хотите изменить владельца? Вы потеряете право управления данной схемой. Данное действие отменить нельзя'
        )
      ) {
        return;
      }
      controller.setOwner(newValue);
    },
    [controller, item?.owner, ownerSelector]
  );

  return (
    <div className='flex flex-col'>
      {accessLevel >= UserLevel.OWNER ? (
        <Overlay position='top-[-0.5rem] left-[2.3rem] cc-icons'>
          <MiniButton
            title='Изменить путь'
            noHover
            onClick={() => controller.promptLocation()}
            icon={<IconEdit size='1rem' className='mt-1 icon-primary' />}
            disabled={isModified || controller.isProcessing}
          />
        </Overlay>
      ) : null}
      <LabeledValue className='sm:mb-1 text-ellipsis max-w-[30rem]' label='Путь' text={item?.location ?? ''} />

      {accessLevel >= UserLevel.OWNER ? (
        <Overlay position='top-[-0.5rem] left-[5.5rem] cc-icons'>
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
                className='w-[21rem] sm:w-[23rem] text-sm'
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
        <Overlay position='top-[-0.5rem] left-[5.5rem] cc-icons'>
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
      <Tooltip anchorSelect='#editor_stats' layer='z-modalTooltip'>
        <InfoUsers items={item?.editors ?? []} prefix={prefixes.user_editors} />
      </Tooltip>

      <LabeledValue id='sub_stats' className='sm:mb-1' label='Отслеживают' text={item?.subscribers.length ?? 0} />
      <Tooltip anchorSelect='#sub_stats' layer='z-modalTooltip'>
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