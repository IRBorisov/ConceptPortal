import { useTx } from '@/i18n';
import { type Graph } from '@rsconcept/domain/graph/graph';

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
import { prepareTooltip } from '@/utils/format';

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
  const tx = useTx();
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

  const clearTitle = tx('tx.general.selection.reset');

  return (
    <div className={cn('cc-icons items-center', className)} {...restProps}>
      <MiniButton
        title={tipHotkeys ? prepareTooltip(clearTitle, 'ESC') : clearTitle}
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={handleSelectReset}
        disabled={emptySelection}
      />

      <div ref={selectedElementRef} onBlur={selectedHandleBlur} className='flex items-center relative'>
        <MiniButton
          title={tx('tx.graph.select.expand')}
          hideTitle={isSelectedOpen}
          icon={<IconContextSelection size='1.25rem' className='icon-primary' />}
          onClick={toggleSelected}
          disabled={emptySelection}
        />
        <Dropdown isOpen={isSelectedOpen} stretchLeft>
          <DropdownButton
            text={tx('tx.graph.node.parent.plural')}
            title={
              tipHotkeys ? prepareTooltip(tx('tx.graph.node.parent.plural'), '1') : tx('tx.graph.node.parent.plural')
            }
            icon={<IconGraphInputs size='1.25rem' className='icon-primary' />}
            onClick={handleExpandInputs}
            disabled={emptySelection}
          />
          <DropdownButton
            text={tx('tx.graph.node.child.plural')}
            title={
              tipHotkeys ? prepareTooltip(tx('tx.graph.node.child.plural'), '2') : tx('tx.graph.node.child.plural')
            }
            icon={<IconGraphOutputs size='1.25rem' className='icon-primary' />}
            onClick={handleExpandOutputs}
            disabled={emptySelection}
          />

          <DropdownButton
            text={tx('tx.graph.node.ancestor.plural')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('tx.graph.node.ancestor.plural'), '3')
                : tx('tx.graph.node.ancestor.plural')
            }
            icon={<IconGraphCollapse size='1.25rem' className='icon-primary' />}
            onClick={handleSelectAllInputs}
            disabled={emptySelection}
          />
          <DropdownButton
            text={tx('tx.graph.node.descendant.plural')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('tx.graph.node.descendant.plural'), '4')
                : tx('tx.graph.node.descendant.plural')
            }
            icon={<IconGraphExpand size='1.25rem' className='icon-primary' />}
            onClick={handleSelectAllOutputs}
            disabled={emptySelection}
          />

          <DropdownButton
            text={tx('tx.graph.select.maximize')}
            title={
              !tipHotkeys
                ? tx('tx.graph.select.maximize.hint')
                : prepareTooltip(tx('tx.graph.select.maximize.hint'), '5')
            }
            aria-label={tx('tx.graph.select.maximize.hint')}
            icon={<IconGraphMaximize size='1.25rem' className='icon-primary' />}
            onClick={handleSelectMaximize}
            disabled={emptySelection}
          />
          <DropdownButton
            text={tx('tx.general.selection.invert')}
            title={tipHotkeys ? prepareTooltip(tx('tx.general.selection.invert'), '6') : undefined}
            icon={<IconGraphInverse size='1.25rem' className='icon-primary' />}
            onClick={handleSelectInvert}
          />
        </Dropdown>
      </div>

      <div ref={groupElementRef} onBlur={groupHandleBlur} className='flex items-center relative'>
        <MiniButton
          title={tx('tx.graph.select.group')}
          hideTitle={isGroupOpen}
          icon={<IconGroupSelection size='1.25rem' className='icon-primary' />}
          onClick={toggleGroup}
        />
        <Dropdown isOpen={isGroupOpen} stretchLeft>
          <DropdownButton
            text={tx('tx.concept.system.core.short')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('tx.concept.system.core.select'), 'Z')
                : tx('tx.concept.system.core.select')
            }
            icon={<IconGraphCore size='1.25rem' className='icon-primary' />}
            onClick={handleSelectCore}
          />
          <DropdownButton
            text={tx('tx.cst.crucial.plural')}
            title={tipHotkeys ? prepareTooltip(tx('tx.cst.crucial.select'), 'X') : tx('tx.cst.crucial.select')}
            icon={<IconCrucial size='1.25rem' className='icon-primary' />}
            onClick={handleSelectCrucial}
          />
          <DropdownButton
            text={tx('tx.cst.original.plural.short')}
            title={tipHotkeys ? prepareTooltip(tx('tx.cst.original.select'), 'C') : tx('tx.cst.original.select')}
            icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
            onClick={handleSelectOwned}
          />
          <DropdownButton
            text={tx('tx.concept.inherited.plural')}
            title={
              tipHotkeys ? prepareTooltip(tx('tx.concept.inherited.select'), 'Y') : tx('tx.concept.inherited.select')
            }
            icon={<IconChild size='1.25rem' className='icon-primary' />}
            onClick={handleSelectInherited}
          />
        </Dropdown>
      </div>
    </div>
  );
}
