import { type Graph } from '@/domain/graph/graph';
import { useTx } from '@/i18n/use-tx';

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

  const clearTitle = tx('ui.graphSelection.clear', 'Clear selection');

  return (
    <div className={cn('cc-icons items-center', className)} {...restProps}>
      <MiniButton
        title={tipHotkeys ? prepareTooltip(clearTitle, tx('ui.hotkey.esc', 'ESC')) : clearTitle}
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={handleSelectReset}
        disabled={emptySelection}
      />

      <div ref={selectedElementRef} onBlur={selectedHandleBlur} className='flex items-center relative'>
        <MiniButton
          title={tx('ui.graphSelection.extendFromSelected', 'Extend from current selection…')}
          hideTitle={isSelectedOpen}
          icon={<IconContextSelection size='1.25rem' className='icon-primary' />}
          onClick={toggleSelected}
          disabled={emptySelection}
        />
        <Dropdown isOpen={isSelectedOpen} className='-translate-x-1/2'>
          <DropdownButton
            text={tx('ui.graphSelection.suppliers', 'Suppliers')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.suppliersTitle', 'Select suppliers'), '1')
                : tx('ui.graphSelection.suppliersTitle', 'Select suppliers')
            }
            icon={<IconGraphInputs size='1.25rem' className='icon-primary' />}
            onClick={handleExpandInputs}
            disabled={emptySelection}
          />
          <DropdownButton
            text={tx('ui.graphSelection.consumers', 'Consumers')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.consumersTitle', 'Select consumers'), '2')
                : tx('ui.graphSelection.consumersTitle', 'Select consumers')
            }
            icon={<IconGraphOutputs size='1.25rem' className='icon-primary' />}
            onClick={handleExpandOutputs}
            disabled={emptySelection}
          />

          <DropdownButton
            text={tx('ui.graphSelection.influencers', 'Influencers')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.influencersTitle', 'Select all influencers'), '3')
                : tx('ui.graphSelection.influencersTitle', 'Select all influencers')
            }
            icon={<IconGraphCollapse size='1.25rem' className='icon-primary' />}
            onClick={handleSelectAllInputs}
            disabled={emptySelection}
          />
          <DropdownButton
            text={tx('ui.graphSelection.dependents', 'Dependents')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.dependentsTitle', 'Select all dependents'), '4')
                : tx('ui.graphSelection.dependentsTitle', 'Select all dependents')
            }
            icon={<IconGraphExpand size='1.25rem' className='icon-primary' />}
            onClick={handleSelectAllOutputs}
            disabled={emptySelection}
          />

          <DropdownButton
            text={tx('ui.graphSelection.maximize', 'Maximize')}
            title={
              !tipHotkeys
                ? tx(
                    'ui.graphSelection.maximizeHintMultiline',
                    'Maximize:\nextend selection with constituents that depend only on the selection'
                  )
                : prepareTooltip(
                    tx(
                      'ui.graphSelection.maximizeHintLine',
                      'Maximize: extend selection with constituents that depend only on the selection'
                    ),
                    '5'
                  )
            }
            aria-label={tx(
              'ui.graphSelection.maximizeAria',
              'Maximize: extend selection with constituents that depend only on the selection'
            )}
            icon={<IconGraphMaximize size='1.25rem' className='icon-primary' />}
            onClick={handleSelectMaximize}
            disabled={emptySelection}
          />
          <DropdownButton
            text={tx('ui.graphSelection.invert', 'Invert')}
            title={tipHotkeys ? prepareTooltip(tx('ui.graphSelection.invert', 'Invert'), '6') : undefined}
            icon={<IconGraphInverse size='1.25rem' className='icon-primary' />}
            onClick={handleSelectInvert}
          />
        </Dropdown>
      </div>

      <div ref={groupElementRef} onBlur={groupHandleBlur} className='flex items-center relative'>
        <MiniButton
          title={tx('ui.graphSelection.pickGroup', 'Select group…')}
          hideTitle={isGroupOpen}
          icon={<IconGroupSelection size='1.25rem' className='icon-primary' />}
          onClick={toggleGroup}
        />
        <Dropdown isOpen={isGroupOpen} stretchLeft>
          <DropdownButton
            text={tx('ui.graphSelection.core', 'core')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.coreTitle', 'Select core'), 'Z')
                : tx('ui.graphSelection.coreTitle', 'Select core')
            }
            icon={<IconGraphCore size='1.25rem' className='icon-primary' />}
            onClick={handleSelectCore}
          />
          <DropdownButton
            text={tx('ui.graphSelection.crucial', 'crucial')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.crucialTitle', 'Select crucial'), 'X')
                : tx('ui.graphSelection.crucialTitle', 'Select crucial')
            }
            icon={<IconCrucial size='1.25rem' className='icon-primary' />}
            onClick={handleSelectCrucial}
          />
          <DropdownButton
            text={tx('ui.graphSelection.owned', 'own')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.ownedTitle', 'Select own'), 'C')
                : tx('ui.graphSelection.ownedTitle', 'Select own')
            }
            icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
            onClick={handleSelectOwned}
          />
          <DropdownButton
            text={tx('ui.graphSelection.inherited', 'inherited')}
            title={
              tipHotkeys
                ? prepareTooltip(tx('ui.graphSelection.inheritedTitle', 'Select inherited'), 'Y')
                : tx('ui.graphSelection.inheritedTitle', 'Select inherited')
            }
            icon={<IconChild size='1.25rem' className='icon-primary' />}
            onClick={handleSelectInherited}
          />
        </Dropdown>
      </div>
    </div>
  );
}
