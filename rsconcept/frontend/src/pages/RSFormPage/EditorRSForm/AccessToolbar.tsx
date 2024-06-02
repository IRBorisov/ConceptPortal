import { useMemo } from 'react';

import { VisibilityIcon } from '@/components/DomainIcons';
import { IconImmutable, IconMutable } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import SelectAccessPolicy from '@/components/select/SelectAccessPolicy';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { useAccessMode } from '@/context/AccessModeContext';
import { AccessPolicy } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { UserLevel } from '@/models/user';

import { useRSEdit } from '../RSEditContext';

interface AccessToolbarProps {
  visible: boolean;
  toggleVisible: () => void;
  readOnly: boolean;
  toggleReadOnly: () => void;
}

function AccessToolbar({ visible, toggleVisible, readOnly, toggleReadOnly }: AccessToolbarProps) {
  const controller = useRSEdit();
  const { accessLevel } = useAccessMode();
  const policy = useMemo(
    () => controller.schema?.access_policy ?? AccessPolicy.PRIVATE,
    [controller.schema?.access_policy]
  );

  return (
    <Overlay position='top-[4.5rem] right-0 w-[12rem] pr-2' className='flex'>
      <Label text='Доступ' className='self-center select-none' />
      <div className='ml-auto cc-icons'>
        <SelectAccessPolicy
          disabled={accessLevel <= UserLevel.EDITOR || controller.isProcessing}
          value={policy}
          onChange={newPolicy => controller.setAccessPolicy(newPolicy)}
        />

        <MiniButton
          className='disabled:cursor-auto'
          title={visible ? 'Библиотека: отображать' : 'Библиотека: скрывать'}
          icon={<VisibilityIcon value={visible} />}
          onClick={toggleVisible}
          disabled={accessLevel === UserLevel.READER || controller.isProcessing}
        />

        <MiniButton
          className='disabled:cursor-auto'
          title={readOnly ? 'Изменение: запрещено' : 'Изменение: разрешено'}
          icon={
            readOnly ? (
              <IconImmutable size='1.25rem' className='clr-text-primary' />
            ) : (
              <IconMutable size='1.25rem' className='clr-text-green' />
            )
          }
          onClick={toggleReadOnly}
          disabled={accessLevel === UserLevel.READER || controller.isProcessing}
        />

        <BadgeHelp topic={HelpTopic.VERSIONS} className='max-w-[30rem]' offset={4} />
      </div>
    </Overlay>
  );
}

export default AccessToolbar;
