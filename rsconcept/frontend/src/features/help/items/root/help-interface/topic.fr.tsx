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
        <IconHelp className='inline-icon' /> En complément de cette rubrique, l&apos;aide contextuelle est disponible
        via l&apos;icône dédiée <IconHelp className='inline-icon' />.
      </p>
      <p>
        L&apos;icône <IconTour className='inline-icon' /> indique qu&apos;un tutoriel interactif est disponible pour
        cette zone : un clic ouvre un menu avec le guide rapide et l&apos;accès au manuel. Cette icône reste visible
        même si l&apos;aide contextuelle est désactivée.
      </p>
      <p>
        L&apos;icône <IconVideo className='inline-icon' /> ouvre des vidéos sur différents sujets et le fonctionnement
        du portail. La lecture est proposée sur YouTube et VKontakte.
      </p>

      <h2>{tx('tx.onboarding.tour')}</h2>
      <p>
        Les tutoriels interactifs parcourent l&apos;écran courant étape par étape : un projecteur met en évidence le
        contrôle, et une carte explique son rôle.
      </p>
      <ul>
        <li>
          Sur certains écrans, une visite est proposée dès la première ouverture (par exemple le Bac à sable). Vous
          pouvez la démarrer, la passer ou la fermer avec <kbd>Échap</kbd>.
        </li>
        <li>
          Ailleurs, cliquez <IconTour className='inline-icon' /> et choisissez <em>{tx('tx.help.quickGuide')}</em> pour
          relancer le tutoriel de cette zone — passeport, liste des constituantes, éditeur de concept, graphe des
          termes, bibliothèque, etc.
        </li>
        <li>
          Certaines étapes d&apos;aperçu proposent <em>{tx('tx.general.details')}</em> pour un tutoriel plus détaillé de
          l&apos;onglet ; le terminer ou le passer vous ramène à l&apos;aperçu.
        </li>
        <li>
          Suivant / Retour pour naviguer, Passer pour quitter plus tôt, Terminer à la dernière étape. Quitter la page
          met la visite en pause afin de la reprendre au retour.
        </li>
      </ul>

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
          <IconUser2 size='1.25rem' className='inline-icon' /> le menu utilisateur regroupe des réglages et l&apos;accès
          au profil
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
