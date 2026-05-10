import { useTx } from '@/i18n';

import {
  IconDarkTheme,
  IconHelp,
  IconHelpOff,
  IconLightTheme,
  IconLogin,
  IconLogout,
  IconPin,
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
        The <IconVideo className='inline-icon' /> icon opens videos on various topics and details of how the Portal works.
        Videos are hosted on YouTube and VKontakte.
      </p>

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
