import { BadgeHelp, HelpTopic } from '@/features/help';
import { useRoleStore, UserRole } from '@/features/users';

import { Overlay } from '@/components/Container';
import { MiniButton } from '@/components/Control';
import { VisibilityIcon } from '@/components/DomainIcons';
import { IconImmutable, IconMutable } from '@/components/Icons';
import { Label } from '@/components/Input';
import { PARAMETER } from '@/utils/constants';

import { AccessPolicy, ILibraryItem } from '../backend/types';
import { useMutatingLibrary } from '../backend/useMutatingLibrary';
import { useSetAccessPolicy } from '../backend/useSetAccessPolicy';

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
    <Overlay position='top-[4.5rem] right-0 w-[12rem] pr-2' className='flex' layer='z-bottom'>
      <Label text='Доступ' className='self-center select-none' />
      <div className='ml-auto cc-icons'>
        <SelectAccessPolicy
          disabled={role <= UserRole.EDITOR || isProcessing || isAttachedToOSS}
          value={policy}
          onChange={handleSetAccessPolicy}
        />

        <MiniButton
          title={visible ? 'Библиотека: отображать' : 'Библиотека: скрывать'}
          icon={<VisibilityIcon value={visible} />}
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

        <BadgeHelp topic={HelpTopic.ACCESS} className={PARAMETER.TOOLTIP_WIDTH} offset={4} />
      </div>
    </Overlay>
  );
}
