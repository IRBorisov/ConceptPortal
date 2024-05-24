import { useIntl } from 'react-intl';

import { useUsers } from '@/context/UsersContext';
import { ILibraryItemEx } from '@/models/library';

import LabeledValue from '../ui/LabeledValue';

interface InfoLibraryItemProps {
  item?: ILibraryItemEx;
}

function InfoLibraryItem({ item }: InfoLibraryItemProps) {
  const { getUserLabel } = useUsers();
  const intl = useIntl();
  return (
    <div className='flex flex-col gap-1'>
      <LabeledValue label='Владелец' text={getUserLabel(item?.owner ?? null)} />
      <LabeledValue label='Редакторы' text={item?.editors.length ?? 0} />
      <LabeledValue label='Отслеживают' text={item?.subscribers.length ?? 0} />
      <LabeledValue
        label='Дата обновления'
        text={item ? new Date(item?.time_update).toLocaleString(intl.locale) : ''}
      />
      <LabeledValue label='Дата создания' text={item ? new Date(item?.time_create).toLocaleString(intl.locale) : ''} />
    </div>
  );
}

export default InfoLibraryItem;
