import clsx from 'clsx';

import { MiniButton } from '@/components/Control';
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
} from '@/components/Icons';
import { type Styling } from '@/components/props';
import { type Graph } from '@/models/Graph';

interface ToolbarGraphSelectionProps extends Styling {
  value: number[];
  onChange: (newSelection: number[]) => void;
  graph: Graph;
  isCore: (item: number) => boolean;
  isOwned?: (item: number) => boolean;
  emptySelection?: boolean;
}

export function ToolbarGraphSelection({
  className,
  graph,
  value: selected,
  isCore,
  isOwned,
  onChange,
  emptySelection,
  ...restProps
}: ToolbarGraphSelectionProps) {
  function handleSelectCore() {
    const core = [...graph.nodes.keys()].filter(isCore);
    onChange([...core, ...graph.expandInputs(core)]);
  }

  function handleSelectOwned() {
    if (isOwned) onChange([...graph.nodes.keys()].filter(isOwned));
  }

  return (
    <div className={clsx('cc-icons', className)} {...restProps}>
      <MiniButton
        titleHtml='Сбросить выделение'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={() => onChange([])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Выделить все влияющие'
        icon={<IconGraphCollapse size='1.25rem' className='icon-primary' />}
        onClick={() => onChange([...selected, ...graph.expandAllInputs(selected)])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Выделить все зависимые'
        icon={<IconGraphExpand size='1.25rem' className='icon-primary' />}
        onClick={() => onChange([...selected, ...graph.expandAllOutputs(selected)])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='<b>Максимизация</b> <br/>дополнение выделения конституентами, <br/>зависимыми только от выделенных'
        icon={<IconGraphMaximize size='1.25rem' className='icon-primary' />}
        onClick={() => onChange(graph.maximizePart(selected))}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Выделить поставщиков'
        icon={<IconGraphInputs size='1.25rem' className='icon-primary' />}
        onClick={() => onChange([...selected, ...graph.expandInputs(selected)])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Выделить потребителей'
        icon={<IconGraphOutputs size='1.25rem' className='icon-primary' />}
        onClick={() => onChange([...selected, ...graph.expandOutputs(selected)])}
        disabled={emptySelection}
      />
      <MiniButton
        titleHtml='Инвертировать'
        icon={<IconGraphInverse size='1.25rem' className='icon-primary' />}
        onClick={() => onChange([...graph.nodes.keys()].filter(item => !selected.includes(item)))}
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
