import { type TourStepContent } from '../../models/tour';

export const createRelativizationContentFr: Record<string, TourStepContent> = {
  target: {
    title: 'Constituant de relativisation',
    body: (
      <p>
        Sur la page d’un schéma conceptuel, ouvrez « Modification » → « Relativisation ». Choisissez un ensemble de base
        ou une structure qui définit les contextes admissibles. Si un tel constituant est déjà sélectionné, le dialogue
        le propose.
      </p>
    )
  },
  parameters: {
    title: 'Exclusions',
    body: (
      <p>
        Sélectionnez les constituants du noyau qui doivent rester sans paramètre de contexte direct. Les exclusions sont
        facultatives.
      </p>
    )
  },
  result: {
    title: 'Titre et nouveau schéma',
    body: (
      <p>
        Le Portail propose un titre modifiable. Saisissez un nom court, puis cliquez sur « Créer ». Le résultat est un
        schéma conceptuel autonome dans la bibliothèque.
      </p>
    )
  }
};
