import { type TourStepContent } from '../../models/tour';

export const createRelativizationContentFr: Record<string, TourStepContent> = {
  source: {
    title: 'Schéma source',
    body: (
      <p>
        Dans le graphe du SOS, ouvrez « Ajouter… » → « Relativisation ». L’opération prend un schéma conceptuel associé.
        Le schéma du nœud sélectionné est proposé à l’ouverture.
      </p>
    )
  },
  parameters: {
    title: 'Constituant de relativisation et exclusions',
    body: (
      <p>
        Dans « Constituant de relativisation », choisissez un ensemble de base ou une structure qui définit les
        contextes admissibles. Sélectionnez les constituants du noyau qui doivent rester sans paramètre de contexte
        direct. Les exclusions sont facultatives.
      </p>
    )
  },
  result: {
    title: 'Titre et résultat',
    body: (
      <p>
        Vérifiez le titre et indiquez un alias. Cliquez sur « Vérifier les textes », ouvrez chaque proposition du noyau,
        apportez les précisions demandées, puis cliquez sur « Confirmer les textes et créer le SC ». Le résultat
        apparaît dans le graphe.
      </p>
    )
  }
};
