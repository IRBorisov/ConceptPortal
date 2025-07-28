import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconGraphCollapse,
  IconGraphCore,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphInverse,
  IconGraphMaximize,
  IconGraphOutputs,
  IconGraphSelection,
  IconPredecessor,
  IconReset
} from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { type Graph } from '@/models/graph';

interface ToolbarGraphSelectionProps extends Styling {
  value: number[];
  onChange: (newSelection: number[]) => void;
  graph: Graph;
  isCore: (item: number) => boolean;
  isOwned?: (item: number) => boolean;
}

export function ToolbarGraphSelection({
  className,
  graph,
  value: selected,
  isCore,
  isOwned,
  onChange,
  ...restProps
}: ToolbarGraphSelectionProps) {
  const menu = useDropdown();
  const emptySelection = selected.length === 0;

  function handleSelectCore() {
    const core = [...graph.nodes.keys()].filter(isCore);
    onChange([...core, ...graph.expandInputs(core)]);
  }

  function handleSelectOwned() {
    if (isOwned) onChange([...graph.nodes.keys()].filter(isOwned));
  }

  return (
    <div className={cn('cc-icons items-center', className)} {...restProps}>
      <MiniButton
        title='Сбросить выделение'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={() => onChange([])}
        disabled={emptySelection}
      />
      <div ref={menu.ref} onBlur={menu.handleBlur} className='flex items-center relative'>
        <MiniButton
          title='Выделить...'
          hideTitle={menu.isOpen}
          icon={<IconGraphSelection size='1.25rem' className='icon-primary' />}
          onClick={menu.toggle}
          disabled={emptySelection}
        />
        <Dropdown isOpen={menu.isOpen} className='-translate-x-1/2'>
          <DropdownButton
            text='Влияющие'
            title='Выделить все влияющие'
            icon={<IconGraphCollapse size='1.25rem' className='icon-primary' />}
            onClick={() => onChange([...selected, ...graph.expandAllInputs(selected)])}
            disabled={emptySelection}
          />
          <DropdownButton
            text='Зависимые'
            title='Выделить все зависимые'
            icon={<IconGraphExpand size='1.25rem' className='icon-primary' />}
            onClick={() => onChange([...selected, ...graph.expandAllOutputs(selected)])}
            disabled={emptySelection}
          />

          <DropdownButton
            text='Поставщики'
            title='Выделить поставщиков'
            icon={<IconGraphInputs size='1.25rem' className='icon-primary' />}
            onClick={() => onChange([...selected, ...graph.expandInputs(selected)])}
            disabled={emptySelection}
          />
          <DropdownButton
            text='Потребители'
            title='Выделить потребителей'
            icon={<IconGraphOutputs size='1.25rem' className='icon-primary' />}
            onClick={() => onChange([...selected, ...graph.expandOutputs(selected)])}
            disabled={emptySelection}
          />
          <DropdownButton
            text='Максимизация'
            titleHtml='<b>Максимизация</b> <br/>дополнение выделения конституентами, <br/>зависимыми только от выделенных'
            aria-label='Максимизация - дополнение выделения конституентами, зависимыми только от выделенных'
            icon={<IconGraphMaximize size='1.25rem' className='icon-primary' />}
            onClick={() => onChange(graph.maximizePart(selected))}
            disabled={emptySelection}
          />
        </Dropdown>
      </div>

      <MiniButton
        title='Выделить ядро'
        icon={<IconGraphCore size='1.25rem' className='icon-primary' />}
        onClick={handleSelectCore}
      />
      <MiniButton
        title='Выделить собственные'
        icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
        onClick={handleSelectOwned}
      />
      <MiniButton
        title='Инвертировать'
        icon={<IconGraphInverse size='1.25rem' className='icon-primary' />}
        onClick={() => onChange([...graph.nodes.keys()].filter(item => !selected.includes(item)))}
      />
    </div>
  );
}
