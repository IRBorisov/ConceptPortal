import { useTx } from '@/i18n';

export function HelpRSLangExpressionSetFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.set')}</h1>
      <p>
        Les expressions ensemblistes (EE) dans RSLang sont utilisées pour définir et
        transformer des ensembles. Les constructions complexes d'expressions ensemblistes sont traitées dans des
        sections individuelles du guide.
      </p>
      <p>
        Cette section présente les opérations classiques sur les ensembles, construites à partir de prédicats
        d'appartenance et de connecteurs logiques.
      </p>

      <h2>Opérations de base</h2>
      <ul>
        <li>
          <b>Union</b> : <code>D1 ∪ D2</code> — ensemble des éléments appartenant à D1 ou D2.
        </li>
        <li>
          <b>Intersection</b> : <code>D1 ∩ D2</code> — ensemble des éléments appartenant à la fois à D1 et D2.
        </li>
        <li>
          <b>Différence</b> : <code>D1 \ D2</code> — ensemble des éléments de D1 qui ne sont pas dans D2.
        </li>
        <li>
          <b>Différence symétrique</b> : <code>D1 ∆ D2</code> — ensemble des éléments appartenant exclusivement à D1
          ou exclusivement à D2.
        </li>
      </ul>

      <h2>{tx('tx.general.example')}</h2>
      <ul>
        <li>
          <code>{`{1,2} ∪ {2,3} = {1,2,3}`}</code>
        </li>
        <li>
          <code>{`{1,2,3} ∩ {2,3,4} = {2,3}`}</code>
        </li>
        <li>
          <code>{`{1,2,3} \\ {2} = {1,3}`}</code>
        </li>
      </ul>
    </>
  );
}
