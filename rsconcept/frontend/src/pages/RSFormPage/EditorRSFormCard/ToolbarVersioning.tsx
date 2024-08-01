import { IconNewItem, IconUpload, IconVersions } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { HelpTopic } from '@/models/miscellaneous';
import { PARAMETER } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';

interface ToolbarVersioningProps {
  blockReload?: boolean;
}

function ToolbarVersioning({ blockReload }: ToolbarVersioningProps) {
  const controller = useRSEdit();
  return (
    <Overlay position='top-[-0.4rem] right-[0rem]' className='pr-2 cc-icons'>
      {controller.isMutable ? (
        <>
          <MiniButton
            titleHtml={
              blockReload
                ? 'Невозможно откатить КС, прикрепленную к операционной схеме'
                : !controller.isContentEditable
                ? 'Откатить к версии'
                : 'Переключитесь на <br/>неактуальную версию'
            }
            disabled={controller.isContentEditable || blockReload}
            onClick={() => controller.restoreVersion()}
            icon={<IconUpload size='1.25rem' className='icon-red' />}
          />
          <MiniButton
            titleHtml={controller.isContentEditable ? 'Создать версию' : 'Переключитесь <br/>на актуальную версию'}
            disabled={!controller.isContentEditable}
            onClick={controller.createVersion}
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
          />
          <MiniButton
            title={controller.schema?.versions.length === 0 ? 'Список версий пуст' : 'Редактировать версии'}
            disabled={!controller.schema || controller.schema?.versions.length === 0}
            onClick={controller.promptEditVersions}
            icon={<IconVersions size='1.25rem' className='icon-primary' />}
          />
        </>
      ) : null}
      <BadgeHelp topic={HelpTopic.VERSIONS} className={PARAMETER.TOOLTIP_WIDTH} offset={4} />
    </Overlay>
  );
}

export default ToolbarVersioning;
