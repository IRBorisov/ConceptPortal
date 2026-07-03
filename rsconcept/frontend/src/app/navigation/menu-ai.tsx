'use client';

import { useTx } from '@/i18n';

import { useAiDialogsStore } from '@/features/ai/dialogs/ai-dialog-store';
import { useAuth } from '@/features/auth/backend/use-auth';

import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconAssistant, IconChat, IconRobot, IconTemplates } from '@/components/icons';
import { external_urls, globalIDs } from '@/utils/constants';

import { urls } from '../urls';

import { NavigationButton } from './navigation-button';
import { useConceptNavigation } from './navigation-context';

export function MenuAI() {
  const tx = useTx();
  const router = useConceptNavigation();
  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();
  const { user } = useAuth();
  const showAIPrompt = useAiDialogsStore(state => state.showAIPrompt);

  function openRstoolReadme() {
    hideMenu();
    window.open(external_urls.git_rstool, '_blank', 'noopener,noreferrer');
  }

  function navigateTemplates(event: React.MouseEvent<Element>) {
    hideMenu();
    router.push({ path: urls.prompt_templates, newTab: event.ctrlKey || event.metaKey });
  }

  function handleCreatePrompt(event: React.MouseEvent<Element>) {
    event.preventDefault();
    event.stopPropagation();
    hideMenu();
    showAIPrompt();
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className='flex items-center justify-start relative h-full'>
      <NavigationButton
        title={tx('tx.ai')}
        hideTitle={isMenuOpen}
        aria-expanded={isMenuOpen}
        aria-controls={globalIDs.ai_dropdown}
        icon={<IconAssistant size='1.25rem' />}
        onClick={toggleMenu}
      />

      <Dropdown id={globalIDs.ai_dropdown} className='min-w-[12ch] max-w-48' stretchLeft isOpen={isMenuOpen}>
        <DropdownButton
          text={tx('tx.ai.agent')}
          title={tx('tx.ai.agent.hint')}
          icon={<IconRobot size='1rem' />}
          onClick={openRstoolReadme}
        />
        <DropdownButton
          text={tx('tx.ai.prompt')}
          title={tx('tx.ai.prompt.create')}
          icon={<IconChat size='1rem' />}
          onClick={handleCreatePrompt}
        />
        <DropdownButton
          text={tx('tx.ai.template.plural.short')}
          title={user.id ? tx('tx.ai.template.plural') : tx('tx.shell.auth.required')}
          icon={<IconTemplates size='1rem' />}
          onClick={navigateTemplates}
          disabled={!user.id}
        />
      </Dropdown>
    </div>
  );
}
