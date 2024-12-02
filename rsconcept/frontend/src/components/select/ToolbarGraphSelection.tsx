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
  selected: number[];
  isCore: (item: number) => boolean;
  isOwned?: (item: number) => boolean;
  setSelected: (newSelection: number[]) => void;
  emptySelection?: boolean;
}

function ToolbarGraphSelection({
  className,
  graph,
  selected,
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
    () => (isOwned ? setSelected([...graph.nodes.keys()].filter(isOwned)) : undefined),
    [setSelected, graph, isOwned]
  );

  const handleInvertSelection = useCallback(
    () => setSelected([...graph.nodes.keys()].filter(item => !selected.includes(item))),
    [setSelected, selected, graph]
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
        onClick={() => setSelected([...selected, ...graph.expandAllInputs(selected)])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Выделить все зависимые'
        icon={<IconGraphExpand size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected([...selected, ...graph.expandAllOutputs(selected)])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='<b>Максимизация</b> <br/>дополнение выделения конституентами, <br/>зависимыми только от выделенных'
        icon={<IconGraphMaximize size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected(graph.maximizePart(selected))}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Выделить поставщиков'
        icon={<IconGraphInputs size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected([...selected, ...graph.expandInputs(selected)])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Выделить потребителей'
        icon={<IconGraphOutputs size='1.25rem' className='icon-primary' />}
        onClick={() => setSelected([...selected, ...graph.expandOutputs(selected)])}
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
      {isOwned ? (
        <MiniButton
          titleHtml='Выделить собственные'
          icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
          onClick={handleSelectOwned}
        />
      ) : null}
    </div>
  );
}

export default ToolbarGraphSelection;
