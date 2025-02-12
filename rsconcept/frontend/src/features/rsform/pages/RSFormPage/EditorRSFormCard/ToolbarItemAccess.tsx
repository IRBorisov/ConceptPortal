import { Overlay } from '@/components/Container';
import { MiniButton } from '@/components/Control';
import { VisibilityIcon } from '@/components/DomainIcons';
import { IconImmutable, IconMutable } from '@/components/Icons';
import { Label } from '@/components/Input';
import { BadgeHelp, HelpTopic } from '@/features/help';
import { useMutatingLibrary } from '@/features/library/backend/useMutatingLibrary';
import { useSetAccessPolicy } from '@/features/library/backend/useSetAccessPolicy';
import SelectAccessPolicy from '@/features/library/components/SelectAccessPolicy';
import { AccessPolicy, ILibraryItemEditor } from '@/features/library/models/library';
import { useRoleStore } from '@/features/users';
import { UserRole } from '@/features/users/models/user';
import { PARAMETER } from '@/utils/constants';

interface ToolbarItemAccessProps {
  visible: boolean;
  toggleVisible: () => void;
  readOnly: boolean;
  toggleReadOnly: () => void;
  controller: ILibraryItemEditor;
}

function ToolbarItemAccess({ visible, toggleVisible, readOnly, toggleReadOnly, controller }: ToolbarItemAccessProps) {
  const role = useRoleStore(state => state.role);
  const isProcessing = useMutatingLibrary();
  const policy = controller.schema.access_policy;
  const { setAccessPolicy } = useSetAccessPolicy();

  function handleSetAccessPolicy(newPolicy: AccessPolicy) {
    void setAccessPolicy({ itemID: controller.schema.id, policy: newPolicy });
  }

  return (
    <Overlay position='top-[4.5rem] right-0 w-[12rem] pr-2' className='flex' layer='z-bottom'>
      <Label text='Доступ' className='self-center select-none' />
      <div className='ml-auto cc-icons'>
        <SelectAccessPolicy
          disabled={role <= UserRole.EDITOR || isProcessing || controller.isAttachedToOSS}
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

export default ToolbarItemAccess;
