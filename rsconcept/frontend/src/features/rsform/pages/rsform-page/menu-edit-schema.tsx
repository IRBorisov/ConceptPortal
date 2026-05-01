'use client';

import { type Constituenta } from '@/domain/library';
import { cstCanProduceStructure } from '@/domain/library/rsform-api';

import { useConceptNavigation } from '@/app';
import { useTx } from '@/app/i18n/use-tx';
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
        title={tx(
          'ui.rsform.menu.archiveNoEdit',
          'Archive: editing disabled\nGo to the current version'
        )}
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
        title={tx('ui.rsform.menu.editing', 'Editing')}
        hideTitle={isMenuOpen}
        className='h-full px-3 text-muted-foreground hover:text-primary cc-animate-color'
        icon={<IconEdit2 size='1.25rem' />}
        onClick={toggleMenu}
      />
      <Dropdown isOpen={isMenuOpen} margin='mt-3'>
        <DropdownButton
          text={tx('ui.rsform.menu.templates', 'Templates')}
          title={tx('ui.rsform.menu.templatesTitle', 'Create a constituent from a template')}
          icon={<IconTemplates size='1rem' className='icon-green' />}
          onClick={handleTemplates}
          disabled={!isContentEditable || isProcessing}
        />
        <DropdownButton
          text={tx('ui.rsform.menu.embedding', 'Embedding')}
          title={tx(
            'ui.rsform.menu.embeddingTitle',
            'Import a set of\nconstituents from another schema'
          )}
          aria-label={tx(
            'ui.rsform.menu.embeddingAria',
            'Import a set of constituents from another schema'
          )}
          icon={<IconInlineSynthesis size='1rem' className='icon-green' />}
          onClick={handleInlineSynthesis}
          disabled={!isContentEditable || isProcessing}
        />

        <Divider margins='mx-3 my-1' />

        <DropdownButton
          text={tx('ui.rsform.menu.restoreOrder', 'Reorder list')}
          title={tx(
            'ui.rsform.menu.restoreOrderTitle',
            'Reorder the list according to\ntypes logic and constituent links'
          )}
          aria-label={tx(
            'ui.rsform.menu.restoreOrderAria',
            'Reorder the list according to types logic and constituent links'
          )}
          icon={<IconSortList size='1rem' className='icon-primary' />}
          onClick={handleRestoreOrder}
          disabled={!isContentEditable || isProcessing}
        />
        <DropdownButton
          text={tx('ui.rsform.menu.ordinalNames', 'Ordinal names')}
          title={tx(
            'ui.rsform.menu.ordinalNamesTitle',
            'Assign ordinal names\nand refresh expressions'
          )}
          aria-label={tx(
            'ui.rsform.menu.ordinalNamesAria',
            'Assign ordinal names and refresh expressions'
          )}
          icon={<IconGenerateNames size='1rem' className='icon-primary' />}
          onClick={handleReindex}
          disabled={!isContentEditable || isProcessing}
        />
        <DropdownButton
          text={tx('ui.rsform.menu.structureExpansion', 'Structure expansion')}
          title={tx(
            'ui.rsform.menu.structureExpansionTitle',
            'Spawn inner notions\nfrom the typing structure\nof the selected constituent'
          )}
          aria-label={tx(
            'ui.rsform.menu.structureExpansionAria',
            'Spawn inner notions from the typing structure of the selected constituent'
          )}
          icon={<IconGenerateStructure size='1rem' className='icon-primary' />}
          onClick={() => handleProduceStructure(activeCst)}
          disabled={isProcessing || !activeCst || (!activeCst.spawner_path && !cstCanProduceStructure(activeCst))}
        />
        <DropdownButton
          text={tx('ui.rsform.menu.substitution', 'Identification')}
          title={tx(
            'ui.rsform.menu.substitutionTitle',
            'Replace occurrences\nof one constituent with another'
          )}
          aria-label={tx(
            'ui.rsform.menu.substitutionAria',
            'Replace occurrences of one constituent with another'
          )}
          icon={<IconReplace size='1rem' className='icon-red' />}
          onClick={handleSubstituteCst}
          disabled={!isContentEditable || isProcessing}
        />
      </Dropdown>
    </div>
  );
}
