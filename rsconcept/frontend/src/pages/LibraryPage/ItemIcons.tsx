import clsx from 'clsx';

import { EducationIcon, GroupIcon, SubscribedIcon } from '@/components/Icons';
import { ICurrentUser, ILibraryItem } from '@/models/library';
import { prefixes } from '@/utils/constants';

interface ItemIconsProps {
  user?: ICurrentUser
  item: ILibraryItem
}

function ItemIcons({ user, item }: ItemIconsProps) {
  return (
  <div
    className={clsx(
      'min-w-[2.75rem]',
      'inline-flex gap-1'
    )}
    id={`${prefixes.library_list}${item.id}`}
  >
    {(user && user.subscriptions.includes(item.id)) ?
    <span title='Отслеживаемая'>
      <SubscribedIcon size={3} />
    </span> : null}
    {item.is_common ?
    <span title='Общедоступная'>
      <GroupIcon size={3}/>
    </span> : null}
    {item.is_canonical ?
    <span title='Неизменная'>
      <EducationIcon size={3}/>
    </span> : null}
  </div>);
}

export default ItemIcons;