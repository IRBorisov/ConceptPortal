import { BiGitBranch, BiGitMerge, BiReset } from 'react-icons/bi';
import { LuExpand, LuMaximize, LuMinimize } from 'react-icons/lu';

import MiniButton from '@/components/ui/MiniButton';

import { useRSEdit } from '../RSEditContext';

function GraphSidebar() {
  const controller = useRSEdit();

  return (
    <div className='flex flex-col gap-1 clr-app'>
      <MiniButton
        titleHtml='<b>Сбросить выделение</b>'
        icon={<BiReset size='1.25rem' className='icon-primary' />}
        onClick={controller.deselectAll}
      />
      <MiniButton
        titleHtml='<b>Выделение базиса</b> - замыкание выделения влияющими конституентами'
        icon={<LuMinimize size='1.25rem' className='icon-primary' />}
        disabled={controller.nothingSelected}
      />
      <MiniButton
        titleHtml='<b>Максимизация части</b> - замыкание выделения конституентами, зависимыми только от выделенных'
        icon={<LuMaximize size='1.25rem' className='icon-primary' />}
        disabled={controller.nothingSelected}
      />
      <MiniButton
        title='Выделить все зависимые'
        icon={<LuExpand size='1.25rem' className='icon-primary' />}
        disabled={controller.nothingSelected}
      />
      <MiniButton
        title='Выделить поставщиков'
        icon={<BiGitBranch size='1.25rem' className='icon-primary' />}
        disabled={controller.nothingSelected}
      />
      <MiniButton
        title='Выделить потребителей'
        icon={<BiGitMerge size='1.25rem' className='icon-primary' />}
        disabled={controller.nothingSelected}
      />
    </div>
  );
}

export default GraphSidebar;
