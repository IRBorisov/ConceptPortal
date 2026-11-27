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
        Choisissez un ensemble de base ou une structure générique. Dans « Constituants exclus », cochez les concepts non
        définis communs aux contextes.
      </p>
    )
  },
  result: {
    title: 'Titre et résultat',
    body: (
      <p>
        Vérifiez le titre et indiquez une abréviation. Choisissez « Créer sans vérification » pour utiliser les textes
        proposés ou « Vérifier les textes » pour les modifier.
      </p>
    )
  }
};
