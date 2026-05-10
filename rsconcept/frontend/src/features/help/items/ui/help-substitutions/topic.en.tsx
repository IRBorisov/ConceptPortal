import { useTx } from '@/i18n';

export function HelpSubstitutionsEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.substitution.table')}</h1>
      <p>A pair of identifications denoting the replacement of occurrences of one constituent by another.</p>
      <p>
        The identification table imposes the following constraints:
        <ul>
          <li>a constituent may be the deleted element in only one identification</li>
          <li>deleted constituents cannot be substitutes in any identification</li>
          <li>base sets can only substitute other base sets</li>
          <li>constant sets can only substitute other constant sets</li>
          <li>
            when identifying constituents other than base and constant sets, their typifications must match, taking other
            identifications into account
          </li>
          <li>logical expressions can only substitute other logical expressions</li>
          <li>
            when identifying parameterised constituents, the number and typifications of their arguments must match
          </li>
        </ul>
      </p>
    </>
  );
}
