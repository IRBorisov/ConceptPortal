'use client';

import { CstType } from '@/domain/library';
import { useTx } from '@/i18n';

import { useUnsavedChanges } from '@/app';
import { IconCstType } from '@/features/rsform/components/icon-cst-type';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconEdit2, IconGenerateNames, IconReplace, IconSortList } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';

import { useSandboxBundle } from '../../context/bundle-context';

export function MenuEdit() {
  const tx = useTx();
  const { promptUnsaved } = useUnsavedChanges();
  const isModified = useModificationStore(state => state.isModified);
  const { resetAliases, restoreOrder, substituteConstituents } = useSandboxBundle();
  const { schema, createCst } = useSchemaEdit();
  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();

  const showSubstituteCst = useDialogsStore(state => state.showSubstituteCst);

  async function requireUnsavedResolved(): Promise<boolean> {
    if (!isModified) {
      return true;
    }
    const outcome = await promptUnsaved();
    return outcome !== 'cancel';
  }

  async function handleResetAliases() {
    hideMenu();
    if (!(await requireUnsavedResolved())) {
      return;
    }
    resetAliases();
  }

  async function handleSubstitute() {
    hideMenu();
    if (!(await requireUnsavedResolved())) {
      return;
    }
    showSubstituteCst({
      schema,
      onSubstitute: data => substituteConstituents(data.substitutions)
    });
  }

  async function handleRestoreOrder() {
    hideMenu();
    if (!(await requireUnsavedResolved())) {
      return;
    }
    restoreOrder();
  }

  function handleEnableAttribution() {
    hideMenu();
    void createCst(CstType.NOMINAL);
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className='relative'>
      <MiniButton
        noHover
        noPadding
        title={tx('tx.general.editing')}
        hideTitle={isMenuOpen}
        className='h-full px-3 text-muted-foreground hover:text-primary cc-animate-color'
        icon={<IconEdit2 size='1.25rem' />}
        onClick={toggleMenu}
      />
      <Dropdown isOpen={isMenuOpen} margin='mt-3'>
        <DropdownButton
          text={tx('tx.schema.order.restore')}
          title={tx('tx.schema.order.restore.hint')}
          icon={<IconSortList size='1rem' className='icon-primary' />}
          onClick={() => void handleRestoreOrder()}
        />
        <DropdownButton
          text={tx('tx.schema.order.rename')}
          title={tx('tx.schema.order.rename.hint')}
          icon={<IconGenerateNames size='1rem' className='icon-primary' />}
          onClick={() => void handleResetAliases()}
        />
        <DropdownButton
          text={tx('tx.substitution')}
          title={tx('tx.substitution.hint')}
          icon={<IconReplace size='1rem' className='icon-red' />}
          onClick={() => void handleSubstitute()}
        />
        {!schema.is_attributive ? (
          <DropdownButton
            text={tx('tx.attribution')}
            title={tx('tx.attribution.hint')}
            icon={<IconCstType value={CstType.NOMINAL} size='1rem' className='icon-green' />}
            onClick={handleEnableAttribution}
          />
        ) : null}
      </Dropdown>
    </div>
  );
}
