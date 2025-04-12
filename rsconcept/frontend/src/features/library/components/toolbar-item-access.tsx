import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';
import { useRoleStore, UserRole } from '@/features/users';

import { MiniButton } from '@/components/control';
import { IconImmutable, IconMutable } from '@/components/icons';
import { Label } from '@/components/input';

import { type AccessPolicy, type ILibraryItem } from '../backend/types';
import { useMutatingLibrary } from '../backend/use-mutating-library';
import { useSetAccessPolicy } from '../backend/use-set-access-policy';

import { IconItemVisibility } from './icon-item-visibility';
import { SelectAccessPolicy } from './select-access-policy';

interface ToolbarItemAccessProps {
  visible: boolean;
  toggleVisible: () => void;
  readOnly: boolean;
  toggleReadOnly: () => void;
  schema: ILibraryItem;
  isAttachedToOSS: boolean;
  className?: string;
}

export function ToolbarItemAccess({
  className,
  visible,
  toggleVisible,
  readOnly,
  toggleReadOnly,
  schema,
  isAttachedToOSS
}: ToolbarItemAccessProps) {
  const role = useRoleStore(state => state.role);
  const isProcessing = useMutatingLibrary();
  const policy = schema.access_policy;
  const { setAccessPolicy } = useSetAccessPolicy();

  function handleSetAccessPolicy(newPolicy: AccessPolicy) {
    void setAccessPolicy({ itemID: schema.id, policy: newPolicy });
  }

  return (
    <div className={clsx('w-46 flex', className)}>
      <Label text='Доступ' className='self-center select-none' />
      <div className='ml-auto cc-icons'>
        <SelectAccessPolicy
          value={policy}
          onChange={handleSetAccessPolicy}
          disabled={role <= UserRole.EDITOR || isProcessing || isAttachedToOSS}
        />

        <MiniButton
          title={visible ? 'Библиотека: отображать' : 'Библиотека: скрывать'}
          aria-label='Переключатель отображения библиотеки'
          icon={<IconItemVisibility value={visible} />}
          onClick={toggleVisible}
          disabled={role === UserRole.READER || isProcessing}
        />

        <MiniButton
          title={readOnly ? 'Изменение: запрещено' : 'Изменение: разрешено'}
          aria-label='Переключатель режима изменения'
          icon={
            readOnly ? (
              <IconImmutable size='1.25rem' className='text-primary' />
            ) : (
              <IconMutable size='1.25rem' className='text-constructive' />
            )
          }
          onClick={toggleReadOnly}
          disabled={role === UserRole.READER || isProcessing}
        />
        <BadgeHelp topic={HelpTopic.ACCESS} className='mt-0.5' offset={4} />
      </div>
    </div>
  );
}
