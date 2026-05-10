import { useTx } from '@/i18n';

export function HelpConceptStructuringFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.structuring')}</h1>
      <p>
        La structuration s'effectue par l'identification de sous-domaines du domaine d'application — les blocs
        conceptuels.
      </p>
      <p>Les blocs peuvent être imbriqués les uns dans les autres de manière hiérarchique.</p>
      <p>
        Un schéma conceptuel ne peut appartenir qu'à un seul bloc au sein du domaine d'application considéré.
      </p>
    </>
  );
}
