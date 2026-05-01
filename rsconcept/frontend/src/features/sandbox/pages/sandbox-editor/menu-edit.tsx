'use client';

import { useTx } from '@/i18n/use-tx';

import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconEdit2, IconGenerateNames, IconReplace, IconSortList } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { promptUnsaved } from '@/utils/utils';

import { useSandboxBundle } from '../../context/bundle-context';

export function MenuEdit() {
  const tx = useTx();
  const isModified = useModificationStore(state => state.isModified);
  const { resetAliases, restoreOrder, substituteConstituents } = useSandboxBundle();
  const { schema } = useSchemaEdit();
  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();

  const showSubstituteCst = useDialogsStore(state => state.showSubstituteCst);

  function requireSavedChanges(): boolean {
    if (!isModified) {
      return true;
    }
    return promptUnsaved();
  }

  function handleResetAliases() {
    hideMenu();
    if (!requireSavedChanges()) {
      return;
    }
    resetAliases();
  }

  function handleSubstitute() {
    hideMenu();
    if (!requireSavedChanges()) {
      return;
    }
    showSubstituteCst({
      schema,
      onSubstitute: data => substituteConstituents(data.substitutions)
    });
  }

  function handleRestoreOrder() {
    hideMenu();
    if (!requireSavedChanges()) {
      return;
    }
    restoreOrder();
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className='relative'>
      <MiniButton
        noHover
        noPadding
        title={tx('ui.sandbox.editMenu.buttonTitle', 'Editing')}
        hideTitle={isMenuOpen}
        className='h-full px-3 text-muted-foreground hover:text-primary cc-animate-color'
        icon={<IconEdit2 size='1.25rem' />}
        onClick={toggleMenu}
      />
      <Dropdown isOpen={isMenuOpen} margin='mt-3'>
        <DropdownButton
          text={tx('ui.sandbox.editMenu.restoreOrder', 'Reorder list')}
          title={tx('ui.sandbox.editMenu.restoreOrderHint', 'Restore order by types and links')}
          icon={<IconSortList size='1rem' className='icon-primary' />}
          onClick={handleRestoreOrder}
        />
        <DropdownButton
          text={tx('ui.sandbox.editMenu.ordinalNames', 'Ordinal names')}
          title={tx('ui.sandbox.editMenu.ordinalNamesHint', 'Assign names in order and refresh expressions')}
          icon={<IconGenerateNames size='1rem' className='icon-primary' />}
          onClick={handleResetAliases}
        />
        <DropdownButton
          text={tx('ui.sandbox.editMenu.substitution', 'Substitution')}
          title={tx('ui.sandbox.editMenu.substitutionHint', 'Replace some constituents with others')}
          icon={<IconReplace size='1rem' className='icon-red' />}
          onClick={handleSubstitute}
        />
      </Dropdown>
    </div>
  );
}
