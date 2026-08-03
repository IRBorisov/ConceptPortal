import { HelpTopic } from '@/features/help';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const cstTemplateContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Création d’une constituante à partir d’un modèle',
    body: (
      <p>
        Cette boîte de dialogue instancie une expression depuis la{' '}
        <TourHelpLink text="banque d'expressions" topic={HelpTopic.RSL_TEMPLATES} />. Parcourez les trois onglets de
        gauche à droite : <b>Modèle</b> → <b>Arguments</b> → <b>Éditeur</b>. Dans <b>Modèle</b>, filtrez la liste avec{' '}
        <b>Source</b> et <b>Catégorie</b>, puis choisissez un modèle.
      </p>
    )
  },
  workflow: {
    title: 'Arguments',
    body: (
      <>
        <p>
          Dans <b>Arguments</b>, liez chaque paramètre à une constituante du schéma courant ; les valeurs sont
          substituées dans l&apos;expression (y compris les fonctions auxiliaires imbriquées de la banque). En
          dessous apparaît la <b>Définition résultante</b>.
        </p>
        <p>
          Quand tous les arguments sont renseignés, le type de la constituante principale se met à jour automatiquement.
        </p>
      </>
    )
  },
  create: {
    title: 'Éditer et créer',
    body: (
      <>
        <p>
          Dans <b>Éditeur</b>, ajustez le <b>Nom</b>, le <b>Terme</b>, la <b>définition formelle</b> et la{' '}
          <b>définition textuelle</b> de l&apos;élément principal. Cliquez sur <b>Créer</b> : le schéma reçoit toutes
          les fonctions auxiliaires de la banque absentes, puis la constituante principale — les auxiliaires
          d&apos;abord pour garder des références valides.
        </p>
        <p>
          Les noms déjà présents ne sont pas dupliqués ; les noms de la banque sont réécrits dans le schéma cible.
        </p>
      </>
    )
  }
};
