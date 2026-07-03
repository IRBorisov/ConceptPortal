import { useTx } from '@/i18n';

export function HelpRSLangExpressionParameterEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.parameter')}</h1>
      <p>
        Parameterised expressions in the genus-structure language form an independent class of constructs. They are used
        to declare term-functions and predicate-functions. Calling such functions yields a set-theoretic expression
        (STE) or a logical expression (LE), respectively.
      </p>

      <h2>Declaring a term-function</h2>
      <code>F1 ::= [α1∈STE1, α2∈STE2(α1)] STE(α1, α2)</code>
      <ul>
        <li>Inside the square brackets, an ordered list of parameter declarations is given, separated by commas.</li>
        <li>
          A parameter is declared using the membership predicate <code>∈</code>. On the left is the local variable
          identifier; on the right is the domain of the parameter.
        </li>
        <li>
          Declared variables can be used in the domains of subsequent parameters and in the STE defining the function
          result.
        </li>
      </ul>

      <h2>Declaring a predicate-function</h2>
      <code>P1 ::= [α1∈STE1, α2∈STE2(α1)] LE(α1, α2)</code>
      <p>
        The difference from a term-function is that a logical expression follows the parameter list instead of an STE.
      </p>

      <h2>Calling functions</h2>
      <code>F1[ξ1, S1], P1[ξ1\ξ2, ξ3]</code>
      <ul>
        <li>Arguments are listed in square brackets after the function name; order matters.</li>
        <li>The typifications of the arguments are checked against the typifications of the declared parameters.</li>
        <li>The result of calling a term-function is an STE; calling a predicate-function yields an LE.</li>
      </ul>

      <h2>Template expressions</h2>
      <code>F2 ::= [α1∈R1×R2, α2∈R1] α2=pr1(α1)</code>
      <p>
        Functions whose parameters contain <b>radicals</b> are called templates. A radical denotes an arbitrary
        typification in the grade of the function argument.
      </p>
      <ul>
        <li>
          When calling the function, the value of the radical is inferred from the typifications of the arguments. All
          computed values must match.
        </li>
        <li>Radicals with different indices are considered distinct in typification.</li>
        <li>Radicals may only be used in the domains of the parameter declarations, not in the result expression.</li>
      </ul>

      <h2>Typification checking</h2>
      <p>
        When a template function is called, the analyser matches each argument&apos;s typification against the
        corresponding parameter declaration. A radical in a parameter domain is a placeholder for an arbitrary grade;
        its value is inferred from the argument&apos;s actual typification. If the same radical appears in several
        parameters, the inferred grades must agree.
      </p>
      <p>
        On a mismatch, the message gives the expected and actual typifications, for example: expected ζ∈ℬℬ(X1), got Z.
        For arguments after the first, radicals in the expected typification are replaced with values already inferred
        from earlier arguments — <code>R1</code> is shown as the concrete grade, as in the example.
      </p>
      <p>
        If the error is on the first argument and no radical value is available yet, the diagnostic may qualify the
        radical with the function name, e.g. <code>{'R1<P2>'}</code>.
      </p>
    </>
  );
}
