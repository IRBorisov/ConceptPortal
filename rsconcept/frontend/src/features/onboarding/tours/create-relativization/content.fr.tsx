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
    title: 'Constituant à relativiser et exclusions',
    body: (
      <p>
        Dans « Constituant à relativiser », choisissez un ensemble de base ou une structure générique. Ce choix définit
        ce qui constitue un contexte. Vous pouvez exclure les concepts non définis qui doivent rester communs aux
        contextes.
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
