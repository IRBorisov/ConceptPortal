import clsx from 'clsx';

import { IconImmutable, IconPublic } from '@/components/Icons';
import { ICurrentUser, ILibraryItem } from '@/models/library';
import { prefixes } from '@/utils/constants';

interface ItemIconsProps {
  user?: ICurrentUser;
  item: ILibraryItem;
}

function ItemIcons({ item }: ItemIconsProps) {
  return (
    <div className={clsx('min-w-[2.2rem]', 'inline-flex gap-1 align-middle')} id={`${prefixes.library_list}${item.id}`}>
      {item.is_common ? (
        <span title='Общедоступная'>
          <IconPublic size='1rem' />
        </span>
      ) : null}
      {item.is_canonical ? (
        <span title='Неизменная'>
          <IconImmutable size='1rem' />
        </span>
      ) : null}
    </div>
  );
}

export default ItemIcons;
