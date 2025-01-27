import { toast } from 'react-toastify';

import { useIsProcessingLibrary } from '@/backend/library/useIsProcessingLibrary';
import { useSetAccessPolicy } from '@/backend/library/useSetAccessPolicy';
import { VisibilityIcon } from '@/components/DomainIcons';
import { IconImmutable, IconMutable } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import SelectAccessPolicy from '@/components/select/SelectAccessPolicy';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { AccessPolicy, ILibraryItemEditor } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { UserRole } from '@/models/user';
import { useRoleStore } from '@/stores/role';
import { PARAMETER } from '@/utils/constants';
import { information } from '@/utils/labels';

interface ToolbarItemAccessProps {
  visible: boolean;
  toggleVisible: () => void;
  readOnly: boolean;
  toggleReadOnly: () => void;
  controller: ILibraryItemEditor;
}

function ToolbarItemAccess({ visible, toggleVisible, readOnly, toggleReadOnly, controller }: ToolbarItemAccessProps) {
  const role = useRoleStore(state => state.role);
  const isProcessing = useIsProcessingLibrary();
  const policy = controller.schema.access_policy;
  const { setAccessPolicy } = useSetAccessPolicy();

  function handleSetAccessPolicy(newPolicy: AccessPolicy) {
    setAccessPolicy({ itemID: controller.schema.id, policy: newPolicy }, () => toast.success(information.changesSaved));
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
