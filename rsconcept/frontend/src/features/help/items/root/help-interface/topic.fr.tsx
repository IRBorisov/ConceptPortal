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

export function HelpInterfaceFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.general.ui')}</h1>

      <p>
        L&apos;interface repose sur des compos dynamiques avec rendu graphique dans le navigateur. Les thèmes clair et
        sombre sont pris en charge.
      </p>
      <p>
        Des info-bulles contextuelles s&apos;affichent au survol des éléments actifs. Certains éléments changent
        d&apos;apparence (couleur, icône) selon la disponibilité de la fonction associée.
      </p>
      <p>
        <IconHelp className='inline-icon' /> En complément de cette rubrique, l&apos;aide contextuelle est disponible via
        l&apos;icône dédiée <IconHelp className='inline-icon' />.
      </p>
      <p>
        L&apos;icône <IconVideo className='inline-icon' /> ouvre des vidéos sur différents sujets et le fonctionnement du
        portail. La lecture est proposée sur YouTube et VKontakte.
      </p>

      <h2>{tx('tx.general.navigation')}</h2>
      <ul>
        <li>
          <kbd>{isMac() ? 'Cmd + clic' : 'Ctrl + clic'}</kbd> sur un élément de navigation ouvre un nouvel onglet
        </li>
        <li>
          <IconPin size='1.25rem' className='inline-icon' /> le panneau de navigation peut être masqué avec le bouton en
          haut à droite
        </li>
        <li>
          <IconLightTheme className='inline-icon' />
          <IconDarkTheme className='inline-icon' /> sélecteurs de thème
        </li>
        <li>
          <IconLogin size='1.25rem' className='inline-icon' /> connexion / inscription d&apos;un nouvel utilisateur
        </li>
        <li>
          <IconUser2 size='1.25rem' className='inline-icon' /> le menu utilisateur regroupe des réglages et l&apos;accès au
          profil
        </li>

        <li>
          <IconHelp className='inline-icon' />
          <IconHelpOff className='inline-icon' /> désactiver les icônes d&apos;aide contextuelle
        </li>
        <li>
          <IconLogout className='inline-icon' /> déconnexion
        </li>
      </ul>

      <Subtopics headTopic={HelpTopic.INTERFACE} />
    </>
  );
}
