import { useTx } from '@/i18n';

export function HelpTerminologyControlEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lang.terminologyControl')}</h1>
      <p>The Portal lets you control how terms bound to entities in conceptual schemes are used.</p>
      <p>
        This relies on textual references: <i>term usage</i> and <i>word linking.</i>
      </p>
      <p>When referencing a term, word-form parameters are set to keep phrasing grammatically consistent.</p>
      <p>
        <b>Grammeme</b> — the smallest unit of grammatical information, such as gender, number, or case.
      </p>
      <p>
        <b>Word form</b> — the grammatical surface form of a phrase that can vary with its grammatical properties.
      </p>
      <p>
        <b>Lexeme</b> — all grammatical forms and phrases tied to a given multiword unit.
      </p>
      <p>
        When working with phrases, a head word is chosen; it determines the grammeme set and anchors agreement with
        other words in the sentence.
      </p>
    </>
  );
}
