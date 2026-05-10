import { useTx } from '@/i18n';

export function HelpConceptStructuringEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.structuring')}</h1>
      <p>Structuring is carried out by identifying sub-domains of the subject domain — conceptual blocks.</p>
      <p>Blocks can be nested within each other hierarchically.</p>
      <p>A conceptual schema can belong to only one block within the subject domain under consideration.</p>
    </>
  );
}
