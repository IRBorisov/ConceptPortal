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
import { prepareTooltip } from '@/utils/utils';

interface ToolbarGraphSelectionProps extends Styling {
  value: number[];
  onChange: (newSelection: number[]) => void;
  graph: Graph;
  isCore: (item: number) => boolean;
  isCrucial: (item: number) => boolean;
  isInherited: (item: number) => boolean;
  tipHotkeys?: boolean;
}

export function ToolbarGraphSelection({
  className,
  graph,
  value,
  tipHotkeys,
  isCore,
  isInherited,
  isCrucial,
  onChange,
  ...restProps
}: ToolbarGraphSelectionProps) {
  const {
    elementRef: selectedElementRef,
    handleBlur: selectedHandleBlur,
    isOpen: isSelectedOpen,
    toggle: toggleSelected,
    hide: hideSelected
  } = useDropdown();
  const {
    elementRef: groupElementRef,
    handleBlur: groupHandleBlur,
    isOpen: isGroupOpen,
    toggle: toggleGroup,
    hide: hideGroup
  } = useDropdown();
  const emptySelection = value.length === 0;

  function handleSelectReset() {
    onChange([]);
  }

  function handleSelectCore() {
    hideGroup();
    const core = [...graph.nodes.keys()].filter(isCore);
    onChange([...core, ...graph.expandInputs(core)]);
  }

  function handleSelectOwned() {
    hideGroup();
    onChange([...graph.nodes.keys()].filter((item: number) => !isInherited(item)));
  }

  function handleSelectInherited() {
    hideGroup();
    onChange([...graph.nodes.keys()].filter(isInherited));
  }

  function handleSelectCrucial() {
    hideGroup();
    onChange([...graph.nodes.keys()].filter(isCrucial));
  }

  function handleExpandOutputs() {
    onChange([...value, ...graph.expandOutputs(value)]);
  }

  function handleExpandInputs() {
    onChange([...value, ...graph.expandInputs(value)]);
  }

  function handleSelectMaximize() {
    hideSelected();
    onChange(graph.maximizePart(value));
  }

  function handleSelectInvert() {
    hideSelected();
    onChange([...graph.nodes.keys()].filter(item => !value.includes(item)));
  }

  function handleSelectAllInputs() {
    hideSelected();
    onChange([...value, ...graph.expandAllInputs(value)]);
  }

  function handleSelectAllOutputs() {
    hideSelected();
    onChange([...value, ...graph.expandAllOutputs(value)]);
  }

  return (
    <div className={cn('cc-icons items-center', className)} {...restProps}>
      <MiniButton
        title={!tipHotkeys ? 'Сбросить выделение' : undefined}
        titleHtml={tipHotkeys ? prepareTooltip('Сбросить выделение', 'ESC') : undefined}
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={handleSelectReset}
        disabled={emptySelection}
      />

      <div ref={selectedElementRef} onBlur={selectedHandleBlur} className='flex items-center relative'>
        <MiniButton
          title='Выделить на основе выбранных...'
          hideTitle={isSelectedOpen}
          icon={<IconContextSelection size='1.25rem' className='icon-primary' />}
          onClick={toggleSelected}
          disabled={emptySelection}
        />
        <Dropdown isOpen={isSelectedOpen} className='-translate-x-1/2'>
          <DropdownButton
            text='Поставщики'
            title={!tipHotkeys ? 'Выделить поставщиков' : undefined}
            titleHtml={tipHotkeys ? prepareTooltip('Выделить поставщиков', '1') : undefined}
            icon={<IconGraphInputs size='1.25rem' className='icon-primary' />}
            onClick={handleExpandInputs}
            disabled={emptySelection}
          />
          <DropdownButton
            text='Потребители'
            title={!tipHotkeys ? 'Выделить потребителей' : undefined}
            titleHtml={tipHotkeys ? prepareTooltip('Выделить потребителей', '2') : undefined}
            icon={<IconGraphOutputs size='1.25rem' className='icon-primary' />}
            onClick={handleExpandOutputs}
            disabled={emptySelection}
          />

          <DropdownButton
            text='Влияющие'
            title={!tipHotkeys ? 'Выделить все влияющие' : undefined}
            titleHtml={tipHotkeys ? prepareTooltip('Выделить все влияющие', '3') : undefined}
            icon={<IconGraphCollapse size='1.25rem' className='icon-primary' />}
            onClick={handleSelectAllInputs}
            disabled={emptySelection}
          />
          <DropdownButton
            text='Зависимые'
            title={!tipHotkeys ? 'Выделить все зависимые' : undefined}
            titleHtml={tipHotkeys ? prepareTooltip('Выделить все зависимые', '4') : undefined}
            icon={<IconGraphExpand size='1.25rem' className='icon-primary' />}
            onClick={handleSelectAllOutputs}
            disabled={emptySelection}
          />

          <DropdownButton
            text='Максимизация'
            titleHtml={
              !tipHotkeys
                ? '<b>Максимизация</b> <br/>дополнение выделения конституентами, <br/>зависимыми только от выделенных'
                : prepareTooltip(
                    'Максимизация - дополнение выделения конституентами, зависимыми только от выделенных',
                    '5'
                  )
            }
            aria-label='Максимизация - дополнение выделения конституентами, зависимыми только от выделенных'
            icon={<IconGraphMaximize size='1.25rem' className='icon-primary' />}
            onClick={handleSelectMaximize}
            disabled={emptySelection}
          />
          <DropdownButton
            text='Инвертировать'
            titleHtml={tipHotkeys ? prepareTooltip('Инвертировать', '6') : undefined}
            icon={<IconGraphInverse size='1.25rem' className='icon-primary' />}
            onClick={handleSelectInvert}
          />
        </Dropdown>
      </div>

      <div ref={groupElementRef} onBlur={groupHandleBlur} className='flex items-center relative'>
        <MiniButton
          title='Выделить группу...'
          hideTitle={isGroupOpen}
          icon={<IconGroupSelection size='1.25rem' className='icon-primary' />}
          onClick={toggleGroup}
        />
        <Dropdown isOpen={isGroupOpen} stretchLeft>
          <DropdownButton
            text='ядро'
            title={!tipHotkeys ? 'Выделить ядро' : undefined}
            titleHtml={tipHotkeys ? prepareTooltip('Выделить ядро', 'Z') : undefined}
            icon={<IconGraphCore size='1.25rem' className='icon-primary' />}
            onClick={handleSelectCore}
          />
          <DropdownButton
            text='ключевые'
            title={!tipHotkeys ? 'Выделить ключевые' : undefined}
            titleHtml={tipHotkeys ? prepareTooltip('Выделить ключевые', 'X') : undefined}
            icon={<IconCrucial size='1.25rem' className='icon-primary' />}
            onClick={handleSelectCrucial}
          />
          <DropdownButton
            text='собственные'
            title={!tipHotkeys ? 'Выделить собственные' : undefined}
            titleHtml={tipHotkeys ? prepareTooltip('Выделить собственные', 'C') : undefined}
            icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
            onClick={handleSelectOwned}
          />
          <DropdownButton
            text='наследники'
            title={!tipHotkeys ? 'Выделить наследников' : undefined}
            titleHtml={tipHotkeys ? prepareTooltip('Выделить наследников', 'Y') : undefined}
            icon={<IconChild size='1.25rem' className='icon-primary' />}
            onClick={handleSelectInherited}
          />
        </Dropdown>
      </div>
    </div>
  );
}
