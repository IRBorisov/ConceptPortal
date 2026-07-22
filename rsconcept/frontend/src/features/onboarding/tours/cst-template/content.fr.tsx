import { HelpTopic } from '@/features/help';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const cstTemplateContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Créer depuis un modèle',
    body: (
      <p>
        Cette boîte de dialogue instancie une expression depuis la{' '}
        <TourHelpLink text='banque de modèles' topic={HelpTopic.RSL_TEMPLATES} />. Parcourez les trois onglets de gauche
        à droite : Modèle → Arguments → Éditeur.
      </p>
    )
  },
  workflow: {
    title: 'Modèle et arguments',
    body: (
      <>
        <p>
          Dans <b>Modèle</b>, choisissez un concept ou une assertion paramétrés. Dans <b>Arguments</b>, liez chaque
          paramètre à une constituante du schéma courant ; les valeurs sont substituées dans l&apos;expression (y
          compris les aides imbriquées de la banque).
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
          Dans <b>Éditeur</b>, ajustez l&apos;alias, le terme et les définitions de l&apos;élément principal. Créer
          ajoute toutes les aides de la banque absentes du schéma, puis la constituante principale — les aides
          d&apos;abord pour garder des références valides.
        </p>
        <p>Les noms déjà présents ne sont pas dupliqués ; les alias de la banque sont réécrits dans le schéma cible.</p>
      </>
    )
  }
};
