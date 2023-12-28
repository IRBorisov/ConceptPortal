import clsx from 'clsx';
import { BiCheckShield, BiShareAlt } from 'react-icons/bi';
import { FiBell } from 'react-icons/fi';

import { ICurrentUser, ILibraryItem } from '@/models/library';
import { prefixes } from '@/utils/constants';

interface ItemIconsProps {
  user?: ICurrentUser;
  item: ILibraryItem;
}

function ItemIcons({ user, item }: ItemIconsProps) {
  return (
    <div className={clsx('min-w-[2.75rem]', 'inline-flex gap-1')} id={`${prefixes.library_list}${item.id}`}>
      {user && user.subscriptions.includes(item.id) ? (
        <span title='Отслеживаемая'>
          <FiBell size='0.75rem' />
        </span>
      ) : null}
      {item.is_common ? (
        <span title='Общедоступная'>
          <BiShareAlt size='0.75rem' />
        </span>
      ) : null}
      {item.is_canonical ? (
        <span title='Неизменная'>
          <BiCheckShield size='0.75rem' />
        </span>
      ) : null}
    </div>
  );
}

export default ItemIcons;
