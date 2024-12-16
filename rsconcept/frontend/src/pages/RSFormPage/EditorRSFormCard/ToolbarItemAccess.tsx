import { VisibilityIcon } from '@/components/DomainIcons';
import { IconImmutable, IconMutable } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import SelectAccessPolicy from '@/components/select/SelectAccessPolicy';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { useAccessMode } from '@/context/AccessModeContext';
import { AccessPolicy, ILibraryItemEditor } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { UserLevel } from '@/models/user';
import { PARAMETER } from '@/utils/constants';

interface ToolbarItemAccessProps {
  visible: boolean;
  toggleVisible: () => void;
  readOnly: boolean;
  toggleReadOnly: () => void;
  controller: ILibraryItemEditor;
}

function ToolbarItemAccess({ visible, toggleVisible, readOnly, toggleReadOnly, controller }: ToolbarItemAccessProps) {
  const { accessLevel } = useAccessMode();
  const policy = controller.schema?.access_policy ?? AccessPolicy.PRIVATE;

  return (
    <Overlay position='top-[4.5rem] right-0 w-[12rem] pr-2' className='flex' layer='z-bottom'>
      <Label text='Доступ' className='self-center select-none' />
      <div className='ml-auto cc-icons'>
        <SelectAccessPolicy
          disabled={accessLevel <= UserLevel.EDITOR || controller.isProcessing || controller.isAttachedToOSS}
          value={policy}
          onChange={newPolicy => controller.setAccessPolicy(newPolicy)}
        />

        <MiniButton
          title={visible ? 'Библиотека: отображать' : 'Библиотека: скрывать'}
          icon={<VisibilityIcon value={visible} />}
          onClick={toggleVisible}
          disabled={accessLevel === UserLevel.READER || controller.isProcessing}
        />

        <MiniButton
          title={readOnly ? 'Изменение: запрещено' : 'Изменение: разрешено'}
          icon={
            readOnly ? (
              <IconImmutable size='1.25rem' className='clr-text-primary' />
            ) : (
              <IconMutable size='1.25rem' className='text-ok-600' />
            )
          }
          onClick={toggleReadOnly}
          disabled={accessLevel === UserLevel.READER || controller.isProcessing}
        />

        <BadgeHelp topic={HelpTopic.ACCESS} className={PARAMETER.TOOLTIP_WIDTH} offset={4} />
      </div>
    </Overlay>
  );
}

export default ToolbarItemAccess;
