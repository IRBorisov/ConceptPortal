import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';
import { useRoleStore, UserRole } from '@/features/users';

import { MiniButton } from '@/components/Control';
import { IconImmutable, IconMutable } from '@/components/Icons';
import { Label } from '@/components/Input';

import { type AccessPolicy, type ILibraryItem } from '../backend/types';
import { useMutatingLibrary } from '../backend/useMutatingLibrary';
import { useSetAccessPolicy } from '../backend/useSetAccessPolicy';

import { IconItemVisibility } from './IconItemVisibility';
import { SelectAccessPolicy } from './SelectAccessPolicy';

interface ToolbarItemAccessProps {
  visible: boolean;
  toggleVisible: () => void;
  readOnly: boolean;
  toggleReadOnly: () => void;
  schema: ILibraryItem;
  isAttachedToOSS: boolean;
}

export function ToolbarItemAccess({
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
    <div className='absolute z-bottom top-18 right-0 w-48 flex pr-2'>
      <Label text='Доступ' className='self-center select-none' />
      <div className='ml-auto cc-icons'>
        <SelectAccessPolicy
          disabled={role <= UserRole.EDITOR || isProcessing || isAttachedToOSS}
          value={policy}
          onChange={handleSetAccessPolicy}
        />

        <MiniButton
          title={visible ? 'Библиотека: отображать' : 'Библиотека: скрывать'}
          icon={<IconItemVisibility value={visible} />}
          onClick={toggleVisible}
          disabled={role === UserRole.READER || isProcessing}
        />

        <MiniButton
          title={readOnly ? 'Изменение: запрещено' : 'Изменение: разрешено'}
          icon={
            readOnly ? (
              <IconImmutable size='1.25rem' className='text-sec-600' />
            ) : (
              <IconMutable size='1.25rem' className='text-ok-600' />
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
