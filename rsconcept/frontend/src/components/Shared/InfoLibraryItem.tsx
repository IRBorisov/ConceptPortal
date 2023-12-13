import { useIntl } from 'react-intl';

import { useUsers } from '@/context/UsersContext';
import { ILibraryItemEx } from '@/models/library';

interface InfoLibraryItemProps {
  item?: ILibraryItemEx
}

function InfoLibraryItem({ item }: InfoLibraryItemProps) {
  const { getUserLabel } = useUsers();
  const intl = useIntl();
  return (
  <div className='flex flex-col gap-1'>
    <div className='flex justify-start'>
      <label className='font-semibold'>Владелец:</label>
      <span className='min-w-[200px] ml-2 overflow-ellipsis overflow-hidden whitespace-nowrap'>
        {getUserLabel(item?.owner ?? null)}
      </span>
    </div>
    <div className='flex justify-start'>
      <label className='font-semibold'>Отслеживают:</label>
      <span id='subscriber-count' className='ml-2'>
        { item?.subscribers.length ?? 0 }
      </span>
    </div>
    <div className='flex justify-start'>
      <label className='font-semibold'>Дата обновления:</label>
      <span className='ml-2'>{item && new Date(item?.time_update).toLocaleString(intl.locale)}</span>
    </div>
    <div className='flex justify-start'>
      <label className='font-semibold'>Дата создания:</label>
      <span className='ml-8'>{item && new Date(item?.time_create).toLocaleString(intl.locale)}</span>
    </div>
  </div>);
}

export default InfoLibraryItem;
