import { HelpTopic } from '@/features/help';

import { IconCalculateAll, IconCalculateOne, IconSave } from '@/components/icons';
import { isMac } from '@/utils/utils';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

const saveHotkey = isMac() ? 'Cmd + S' : 'Ctrl + S';
const calculateHotkey = isMac() ? 'Cmd + Q' : 'Ctrl + Q';

export const modelValueContentFr: Record<string, TourStepContent> = {
  overview: {
    title: 'Données',
    body: (
      <p>
        L&apos;onglet <TourHelpLink text='Données' topic={HelpTopic.UI_MODEL_VALUE} /> (dans l&apos;aide — données du
        modèle) permet de saisir et consulter les valeurs des constituantes. Sélectionnez une constituante dans la liste
        à gauche. Les concepts non définis reçoivent une interprétation (pour les ensembles de base — des éléments du
        domaine) ; les dérivés se calculent d&apos;après les définitions. Contrairement à l&apos;onglet Évaluation,
        ici vous modifiez les valeurs des constituantes, pas des expressions arbitraires.
      </p>
    )
  },
  tools: {
    title: 'Calcul et enregistrement',
    body: (
      <>
        <p>
          <IconCalculateAll className='inline-icon icon-green' /> (<kbd>Alt + Q</kbd>) recalcule tout le modèle ;{' '}
          <IconCalculateOne className='inline-icon icon-green' /> (<kbd>{calculateHotkey}</kbd>) calcule la constituante
          courante — bouton inactif s&apos;il y a des modifications non enregistrées.
        </p>
        <p>
          <IconSave className='inline-icon' /> (<kbd>{saveHotkey}</kbd>) enregistre les modifications du formulaire
          (terme, définitions, valeur).
        </p>
      </>
    )
  },
  form: {
    title: 'Éditeur de valeur',
    body: (
      <>
        <p>
          Les boutons « Importer » et « Exporter » chargent ou exportent la valeur de la constituante courante
          (presse-papiers ou JSON).
        </p>
        <p>
          Cliquez la barre de statut (« Non évalué » / …) — « Enregistrer et calculer ». Pour les ensembles de base, le{' '}
          <TourHelpLink text="dialogue d'interprétation de base" topic={HelpTopic.UI_MODEL_BINDING} /> définit les
          éléments du domaine ; pour les structures — le dialogue d&apos;édition de valeur. Si le focus est dans le
          champ de définition formelle, <kbd>{calculateHotkey}</kbd> vérifie l&apos;expression, pas la valeur.
        </p>
        <p>
          Voir le manuel <TourHelpLink text='édition des valeurs' topic={HelpTopic.UI_MODEL_VALUE_EDIT} /> pour les
          formats de valeurs.
        </p>
      </>
    )
  }
};
