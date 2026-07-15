import { useTx } from '@/i18n';

import {
  IconDarkTheme,
  IconHelp,
  IconHelpOff,
  IconLightTheme,
  IconLogin,
  IconLogout,
  IconPin,
  IconTour,
  IconUser2,
  IconVideo
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { Subtopics } from '../../../components/subtopics';
import { HelpTopic } from '../../../models/help-topic';

export function HelpInterfaceEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.general.ui')}</h1>

      <p>
        The interface is built from dynamic components with graphics rendered in the browser. Light and dark themes are
        supported.
      </p>
      <p>
        Contextual tooltips appear when you hover active controls. Some controls change appearance (color, icon)
        depending on whether the related feature is available.
      </p>
      <p>
        <IconHelp className='inline-icon' /> In addition to this section, help is available in context via the dedicated{' '}
        <IconHelp className='inline-icon' /> icon.
      </p>
      <p>
        The <IconTour className='inline-icon' /> icon means an interactive tour is available for that area: click it to
        open a menu with a quick guide and a link to the manual. This icon stays visible even when contextual help is
        turned off.
      </p>
      <p>
        The <IconVideo className='inline-icon' /> icon opens videos on various topics and details of how the Portal
        works. Videos are hosted on YouTube and VKontakte.
      </p>

      <h2>{tx('tx.onboarding.tour')}</h2>
      <p>
        Interactive tours walk through the current screen step by step: a spotlight highlights the control, and a card
        explains what it does.
      </p>
      <ul>
        <li>
          On some screens the first visit offers a tour automatically (for example the Sandbox). You can start, skip, or
          dismiss it with <kbd>Esc</kbd>.
        </li>
        <li>
          Elsewhere, click <IconTour className='inline-icon' /> and choose <em>{tx('tx.help.quickGuide')}</em> to
          restart the tour for that area — passport, constituent list, concept editor, term graph, library, and similar.
        </li>
        <li>
          Some overview steps offer <em>{tx('tx.general.details')}</em> for a deeper tour of the current tab; finishing
          or skipping that tour returns you to the overview.
        </li>
        <li>
          Use Next / Back to move between steps, Skip to leave early, and Finish on the last step. Leaving the page
          pauses the tour so you can resume when you return.
        </li>
      </ul>

      <h2>{tx('tx.general.navigation')}</h2>
      <ul>
        <li>
          <kbd>{isMac() ? 'Cmd + click' : 'Ctrl + click'}</kbd> on a navigation item opens a new tab
        </li>
        <li>
          <IconPin size='1.25rem' className='inline-icon' /> the navigation panel can be hidden with the button in the
          upper-right corner
        </li>
        <li>
          <IconLightTheme className='inline-icon' />
          <IconDarkTheme className='inline-icon' /> theme toggles
        </li>
        <li>
          <IconLogin size='1.25rem' className='inline-icon' /> sign in / register a new user
        </li>
        <li>
          <IconUser2 size='1.25rem' className='inline-icon' /> the user menu contains settings and a link to the user
          profile
        </li>

        <li>
          <IconHelp className='inline-icon' />
          <IconHelpOff className='inline-icon' /> turn contextual help icons off
        </li>
        <li>
          <IconLogout className='inline-icon' /> sign out
        </li>
      </ul>

      <Subtopics headTopic={HelpTopic.INTERFACE} />
    </>
  );
}
