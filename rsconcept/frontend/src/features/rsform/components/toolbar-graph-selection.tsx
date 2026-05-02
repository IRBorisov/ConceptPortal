import { type Graph } from '@/domain/graph/graph';
import { useTx } from '@/i18n';

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

  const clearTitle = tx('ui.graphSelection.clear');

  return (
    <div className={cn('cc-icons items-center', className)} {...restProps}>
      <MiniButton
        title={tipHotkeys ? prepareTooltip(clearTitle, tx('ui.hotkey.esc')) : clearTitle}
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={handleSelectReset}
        disabled={emptySelection}
      />

      <div ref={selectedElementRef} onBlur={selectedHandleBlur} className='flex items-center relative'>
        <MiniButton
          title={tx('ui.graphSelection.extendFromSelected')}
          hideTitle={isSelectedOpen}
          icon={<IconContextSelection size='1.25rem' className='icon-primary' />}
          onClick={toggleSelected}
          disabled={emptySelection}
        />
        <Dropdown isOpen={isSelectedOpen} className='-translate-x-1/2'>
          <DropdownButton
            text={tx('ui.graphSelection.suppliers')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.suppliersTitle'), '1')
                : tx('ui.graphSelection.suppliersTitle')
            }
            icon={<IconGraphInputs size='1.25rem' className='icon-primary' />}
            onClick={handleExpandInputs}
            disabled={emptySelection}
          />
          <DropdownButton
            text={tx('ui.graphSelection.consumers')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.consumersTitle'), '2')
                : tx('ui.graphSelection.consumersTitle')
            }
            icon={<IconGraphOutputs size='1.25rem' className='icon-primary' />}
            onClick={handleExpandOutputs}
            disabled={emptySelection}
          />

          <DropdownButton
            text={tx('ui.graphSelection.influencers')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.influencersTitle'), '3')
                : tx('ui.graphSelection.influencersTitle')
            }
            icon={<IconGraphCollapse size='1.25rem' className='icon-primary' />}
            onClick={handleSelectAllInputs}
            disabled={emptySelection}
          />
          <DropdownButton
            text={tx('ui.graphSelection.dependents')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.dependentsTitle'), '4')
                : tx('ui.graphSelection.dependentsTitle')
            }
            icon={<IconGraphExpand size='1.25rem' className='icon-primary' />}
            onClick={handleSelectAllOutputs}
            disabled={emptySelection}
          />

          <DropdownButton
            text={tx('ui.graphSelection.maximize')}
            title={
              !tipHotkeys
                ? tx('ui.graphSelection.maximizeHintMultiline')
                : prepareTooltip(
                    tx('ui.graphSelection.maximizeHintLine'),
                    '5'
                  )
            }
            aria-label={tx('ui.graphSelection.maximizeAria')}
            icon={<IconGraphMaximize size='1.25rem' className='icon-primary' />}
            onClick={handleSelectMaximize}
            disabled={emptySelection}
          />
          <DropdownButton
            text={tx('ui.graphSelection.invert')}
            title={tipHotkeys ? prepareTooltip(tx('ui.graphSelection.invert'), '6') : undefined}
            icon={<IconGraphInverse size='1.25rem' className='icon-primary' />}
            onClick={handleSelectInvert}
          />
        </Dropdown>
      </div>

      <div ref={groupElementRef} onBlur={groupHandleBlur} className='flex items-center relative'>
        <MiniButton
          title={tx('ui.graphSelection.pickGroup')}
          hideTitle={isGroupOpen}
          icon={<IconGroupSelection size='1.25rem' className='icon-primary' />}
          onClick={toggleGroup}
        />
        <Dropdown isOpen={isGroupOpen} stretchLeft>
          <DropdownButton
            text={tx('ui.graphSelection.core')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.coreTitle'), 'Z')
                : tx('ui.graphSelection.coreTitle')
            }
            icon={<IconGraphCore size='1.25rem' className='icon-primary' />}
            onClick={handleSelectCore}
          />
          <DropdownButton
            text={tx('ui.graphSelection.crucial')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.crucialTitle'), 'X')
                : tx('ui.graphSelection.crucialTitle')
            }
            icon={<IconCrucial size='1.25rem' className='icon-primary' />}
            onClick={handleSelectCrucial}
          />
          <DropdownButton
            text={tx('ui.graphSelection.owned')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.ownedTitle'), 'C')
                : tx('ui.graphSelection.ownedTitle')
            }
            icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
            onClick={handleSelectOwned}
          />
          <DropdownButton
            text={tx('ui.graphSelection.inherited')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.inheritedTitle'), 'Y')
                : tx('ui.graphSelection.inheritedTitle')
            }
            icon={<IconChild size='1.25rem' className='icon-primary' />}
            onClick={handleSelectInherited}
          />
        </Dropdown>
      </div>
    </div>
  );
}
