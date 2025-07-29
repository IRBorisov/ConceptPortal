import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconChild,
  IconContextSelection,
  IconCrucial,
  IconGraphCollapse,
  IconGraphCore,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphInverse,
  IconGraphMaximize,
  IconGraphOutputs,
  IconGroupSelection,
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
  isCrucial: (item: number) => boolean;
  isInherited: (item: number) => boolean;
}

export function ToolbarGraphSelection({
  className,
  graph,
  value,
  isCore,
  isInherited,
  isCrucial,
  onChange,
  ...restProps
}: ToolbarGraphSelectionProps) {
  const selectedMenu = useDropdown();
  const groupMenu = useDropdown();
  const emptySelection = value.length === 0;

  function handleSelectReset() {
    onChange([]);
  }

  function handleSelectCore() {
    groupMenu.hide();
    const core = [...graph.nodes.keys()].filter(isCore);
    onChange([...core, ...graph.expandInputs(core)]);
  }

  function handleSelectOwned() {
    groupMenu.hide();
    onChange([...graph.nodes.keys()].filter((item: number) => !isInherited(item)));
  }

  function handleSelectInherited() {
    groupMenu.hide();
    onChange([...graph.nodes.keys()].filter(isInherited));
  }

  function handleSelectCrucial() {
    groupMenu.hide();
    onChange([...graph.nodes.keys()].filter(isCrucial));
  }

  function handleExpandOutputs() {
    onChange([...value, ...graph.expandOutputs(value)]);
  }

  function handleExpandInputs() {
    onChange([...value, ...graph.expandInputs(value)]);
  }

  function handleSelectMaximize() {
    selectedMenu.hide();
    onChange(graph.maximizePart(value));
  }

  function handleSelectInvert() {
    selectedMenu.hide();
    onChange([...graph.nodes.keys()].filter(item => !value.includes(item)));
  }

  function handleSelectAllInputs() {
    selectedMenu.hide();
    onChange([...value, ...graph.expandInputs(value)]);
  }

  function handleSelectAllOutputs() {
    selectedMenu.hide();
    onChange([...value, ...graph.expandOutputs(value)]);
  }

  return (
    <div className={cn('cc-icons items-center', className)} {...restProps}>
      <MiniButton
        title='Сбросить выделение'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={handleSelectReset}
        disabled={emptySelection}
      />

      <div ref={selectedMenu.ref} onBlur={selectedMenu.handleBlur} className='flex items-center relative'>
        <MiniButton
          title='Выделить на основе выбранных...'
          hideTitle={selectedMenu.isOpen}
          icon={<IconContextSelection size='1.25rem' className='icon-primary' />}
          onClick={selectedMenu.toggle}
          disabled={emptySelection}
        />
        <Dropdown isOpen={selectedMenu.isOpen} className='-translate-x-1/2'>
          <DropdownButton
            text='Поставщики'
            title='Выделить поставщиков'
            icon={<IconGraphInputs size='1.25rem' className='icon-primary' />}
            onClick={handleExpandInputs}
            disabled={emptySelection}
          />
          <DropdownButton
            text='Потребители'
            title='Выделить потребителей'
            icon={<IconGraphOutputs size='1.25rem' className='icon-primary' />}
            onClick={handleExpandOutputs}
            disabled={emptySelection}
          />

          <DropdownButton
            text='Влияющие'
            title='Выделить все влияющие'
            icon={<IconGraphCollapse size='1.25rem' className='icon-primary' />}
            onClick={handleSelectAllInputs}
            disabled={emptySelection}
          />
          <DropdownButton
            text='Зависимые'
            title='Выделить все зависимые'
            icon={<IconGraphExpand size='1.25rem' className='icon-primary' />}
            onClick={handleSelectAllOutputs}
            disabled={emptySelection}
          />

          <DropdownButton
            text='Максимизация'
            titleHtml='<b>Максимизация</b> <br/>дополнение выделения конституентами, <br/>зависимыми только от выделенных'
            aria-label='Максимизация - дополнение выделения конституентами, зависимыми только от выделенных'
            icon={<IconGraphMaximize size='1.25rem' className='icon-primary' />}
            onClick={handleSelectMaximize}
            disabled={emptySelection}
          />
          <DropdownButton
            text='Инвертировать'
            icon={<IconGraphInverse size='1.25rem' className='icon-primary' />}
            onClick={handleSelectInvert}
          />
        </Dropdown>
      </div>

      <div ref={groupMenu.ref} onBlur={groupMenu.handleBlur} className='flex items-center relative'>
        <MiniButton
          title='Выделить группу...'
          hideTitle={groupMenu.isOpen}
          icon={<IconGroupSelection size='1.25rem' className='icon-primary' />}
          onClick={groupMenu.toggle}
        />
        <Dropdown isOpen={groupMenu.isOpen} stretchLeft>
          <DropdownButton
            text='ядро'
            title='Выделить ядро'
            icon={<IconGraphCore size='1.25rem' className='icon-primary' />}
            onClick={handleSelectCore}
          />
          <DropdownButton
            text='ключевые'
            title='Выделить ключевые'
            icon={<IconCrucial size='1.25rem' className='icon-primary' />}
            onClick={handleSelectCrucial}
          />
          <DropdownButton
            text='собственные'
            title='Выделить собственные'
            icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
            onClick={handleSelectOwned}
          />
          <DropdownButton
            text='наследники'
            title='Выделить наследников'
            icon={<IconChild size='1.25rem' className='icon-primary' />}
            onClick={handleSelectInherited}
          />
        </Dropdown>
      </div>
    </div>
  );
}
