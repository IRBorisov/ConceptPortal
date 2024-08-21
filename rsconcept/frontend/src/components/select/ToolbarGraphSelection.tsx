import clsx from 'clsx';
import { useCallback } from 'react';

import { Graph } from '@/models/Graph';

import {
  IconGraphCollapse,
  IconGraphCore,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphInverse,
  IconGraphMaximize,
  IconGraphOutputs,
  IconPredecessor,
  IconReset
} from '../Icons';
import { CProps } from '../props';
import MiniButton from '../ui/MiniButton';

interface ToolbarGraphSelectionProps extends CProps.Styling {
  graph: Graph;
  isCore: (item: number) => boolean;
  isOwned: (item: number) => boolean;
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
  emptySelection?: boolean;
}

function ToolbarGraphSelection({
  className,
  graph,
  isCore,
  isOwned,
  setSelected,
  emptySelection,
  ...restProps
}: ToolbarGraphSelectionProps) {
  const handleSelectCore = useCallback(() => {
    const core = [...graph.nodes.keys()].filter(isCore);
    setSelected([...core, ...graph.expandInputs(core)]);
  }, [setSelected, graph, isCore]);

  const handleSelectOwned = useCallback(
    () => setSelected([...graph.nodes.keys()].filter(isOwned)),
    [setSelected, graph, isOwned]
  );

  const handleInvertSelection = useCallback(
    () => setSelected(prev => [...graph.nodes.keys()].filter(item => !prev.includes(item))),
    [setSelected, graph]
  );

  return (
    <div className={clsx('cc-icons', className)} {...restProps}>
      <MiniButton
        titleHtml='Сбросить выделение'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected([])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Выделить все влияющие'
        icon={<IconGraphCollapse size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected(prev => [...prev, ...graph.expandAllInputs(prev)])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Выделить все зависимые'
        icon={<IconGraphExpand size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected(prev => [...prev, ...graph.expandAllOutputs(prev)])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='<b>Максимизация</b> <br/>дополнение выделения конституентами, <br/>зависимыми только от выделенных'
        icon={<IconGraphMaximize size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected(prev => graph.maximizePart(prev))}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Выделить поставщиков'
        icon={<IconGraphInputs size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected(prev => [...prev, ...graph.expandInputs(prev)])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Выделить потребителей'
        icon={<IconGraphOutputs size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected(prev => [...prev, ...graph.expandOutputs(prev)])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Инвертировать'
        icon={<IconGraphInverse size='1.25rem' className='icon-primary' />}
        onClick={handleInvertSelection}
      />
      <MiniButton
        titleHtml='Выделить ядро'
        icon={<IconGraphCore size='1.25rem' className='icon-primary' />}
        onClick={handleSelectCore}
      />
      <MiniButton
        titleHtml='Выделить собственные'
        icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
        onClick={handleSelectOwned}
      />
    </div>
  );
}

export default ToolbarGraphSelection;
