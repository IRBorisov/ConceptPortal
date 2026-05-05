'use client';

import { type Constituenta } from '@/domain/library';
import { cstCanProduceStructure } from '@/domain/library/rsform-api';
import { useTx } from '@/i18n';

import { useConceptNavigation } from '@/app';
import { useAuth } from '@/features/auth';

import { Divider } from '@/components/container';
import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconArchive,
  IconEdit2,
  IconGenerateNames,
  IconGenerateStructure,
  IconInlineSynthesis,
  IconReplace,
  IconSortList,
  IconTemplates
} from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { promptUnsaved } from '@/utils/utils';

import { useInlineSynthesis } from '../../backend/use-inline-synthesis';
import { useResetAliases } from '../../backend/use-reset-aliases';
import { useRestoreOrder } from '../../backend/use-restore-order';
import { useSubstituteConstituents } from '../../backend/use-substitute-constituents';

import { useSchemaEdit } from './schema-edit-context';

export function MenuEditSchema() {
  const tx = useTx();
  const { isAnonymous } = useAuth();
  const isModified = useModificationStore(state => state.isModified);
  const router = useConceptNavigation();
  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();
  const {
    schema,
    activeCst,
    isArchive,
    isContentEditable,
    createCstFromData: createStructurePlannerConstituenta,
    promptTemplate,
    patchConstituenta,
    deselectAll,
    isProcessing
  } = useSchemaEdit();

  const { resetAliases } = useResetAliases();
  const { restoreOrder } = useRestoreOrder();
  const { inlineSynthesis } = useInlineSynthesis();
  const { substituteConstituents } = useSubstituteConstituents();

  const showInlineSynthesis = useDialogsStore(state => state.showInlineSynthesis);
  const showStructurePlanner = useDialogsStore(state => state.showStructurePlanner);
  const showSubstituteCst = useDialogsStore(state => state.showSubstituteCst);

  function handleReindex() {
    hideMenu();
    void resetAliases({ itemID: schema.id });
  }

  function handleRestoreOrder() {
    hideMenu();
    void restoreOrder({ itemID: schema.id });
  }

  function handleSubstituteCst() {
    hideMenu();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showSubstituteCst({
      schema: schema,
      onSubstitute: data => {
        void substituteConstituents({ itemID: schema.id, data });
      }
    });
  }

  function handleTemplates() {
    hideMenu();
    promptTemplate();
  }

  function handleProduceStructure(targetCst: Constituenta | null) {
    hideMenu();
    if (!targetCst) {
      return;
    }
    if (isModified && !promptUnsaved()) {
      return;
    }
    showStructurePlanner({
      schema,
      targetID: targetCst.spawner_path ? targetCst.spawner! : targetCst.id,
      isMutable: isContentEditable,
      onCreate: createStructurePlannerConstituenta,
      onUpdate: patchConstituenta
    });
  }

  function handleInlineSynthesis() {
    hideMenu();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showInlineSynthesis({
      receiver: schema,
      onSynthesis: data => void inlineSynthesis(data).then(() => deselectAll())
    });
  }

  if (isAnonymous) {
    return null;
  }

  if (isArchive) {
    return (
      <MiniButton
        noPadding
        title={tx('ui.rsform.menu.archiveNoEdit')}
        hideTitle={isMenuOpen}
        className='h-full px-3 bg-transparent'
        icon={<IconArchive size='1.25rem' className='icon-primary' />}
        onClick={event => router.gotoRSForm(schema.id, undefined, event.ctrlKey || event.metaKey)}
      />
    );
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
          text={tx('tx.domain.template.plural')}
          title={tx('ui.rsform.menu.templatesTitle')}
          icon={<IconTemplates size='1rem' className='icon-green' />}
          onClick={handleTemplates}
          disabled={!isContentEditable || isProcessing}
        />
        <DropdownButton
          text={tx('ui.rsform.menu.embedding')}
          title={tx('ui.rsform.menu.embeddingTitle')}
          aria-label={tx('ui.rsform.menu.embeddingAria')}
          icon={<IconInlineSynthesis size='1rem' className='icon-green' />}
          onClick={handleInlineSynthesis}
          disabled={!isContentEditable || isProcessing}
        />

        <Divider margins='mx-3 my-1' />

        <DropdownButton
          text={tx('ui.rsform.menu.restoreOrder')}
          title={tx('ui.rsform.menu.restoreOrderTitle')}
          aria-label={tx('ui.rsform.menu.restoreOrderAria')}
          icon={<IconSortList size='1rem' className='icon-primary' />}
          onClick={handleRestoreOrder}
          disabled={!isContentEditable || isProcessing}
        />
        <DropdownButton
          text={tx('ui.rsform.menu.ordinalNames')}
          title={tx('ui.rsform.menu.ordinalNamesTitle')}
          aria-label={tx('ui.rsform.menu.ordinalNamesAria')}
          icon={<IconGenerateNames size='1rem' className='icon-primary' />}
          onClick={handleReindex}
          disabled={!isContentEditable || isProcessing}
        />
        <DropdownButton
          text={tx('ui.rsform.menu.structureExpansion')}
          title={tx('ui.rsform.menu.structureExpansionTitle')}
          aria-label={tx('ui.rsform.menu.structureExpansionAria')}
          icon={<IconGenerateStructure size='1rem' className='icon-primary' />}
          onClick={() => handleProduceStructure(activeCst)}
          disabled={isProcessing || !activeCst || (!activeCst.spawner_path && !cstCanProduceStructure(activeCst))}
        />
        <DropdownButton
          text={tx('tx.lib.cst.substitution')}
          title={tx('ui.rsform.menu.substitutionTitle')}
          aria-label={tx('ui.rsform.menu.substitutionAria')}
          icon={<IconReplace size='1rem' className='icon-red' />}
          onClick={handleSubstituteCst}
          disabled={!isContentEditable || isProcessing}
        />
      </Dropdown>
    </div>
  );
}
