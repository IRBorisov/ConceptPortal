import clsx from 'clsx';

import { Graph } from '@/models/Graph';

import {
  IconGraphCollapse,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphMaximize,
  IconGraphOutputs,
  IconReset
} from '../Icons';
import { CProps } from '../props';
import MiniButton from '../ui/MiniButton';

interface SelectGraphToolbarProps extends CProps.Styling {
  graph: Graph;
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

function SelectGraphToolbar({ className, graph, setSelected, ...restProps }: SelectGraphToolbarProps) {
  return (
    <div className={clsx('cc-icons', className)} {...restProps}>
      <MiniButton
        titleHtml='Сбросить выделение'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected([])}
      />
      <MiniButton
        titleHtml='Выделить все влияющие'
        icon={<IconGraphCollapse size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected(prev => [...prev, ...graph.expandAllInputs(prev)])}
      />
      <MiniButton
        titleHtml='Выделить все зависимые'
        icon={<IconGraphExpand size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected(prev => [...prev, ...graph.expandAllOutputs(prev)])}
      />
      <MiniButton
        titleHtml='<b>Максимизация</b> - дополнение выделения конституентами, зависимыми только от выделенных'
        icon={<IconGraphMaximize size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected(prev => graph.maximizePart(prev))}
      />
      <MiniButton
        titleHtml='Выделить поставщиков'
        icon={<IconGraphInputs size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected(prev => [...prev, ...graph.expandInputs(prev)])}
      />
      <MiniButton
        titleHtml='Выделить потребителей'
        icon={<IconGraphOutputs size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected(prev => [...prev, ...graph.expandOutputs(prev)])}
      />
    </div>
  );
}

export default SelectGraphToolbar;
