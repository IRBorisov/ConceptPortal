import { useTx } from '@/i18n';

export function HelpRSLangTemplatesEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rsexpression.templateBank')}</h1>
      <p>
        The Portal provides quick access to frequently used expressions via the constituent-from-template creation
        feature.
      </p>
      <p>
        The source of templates is the <b>Expression Bank</b>, which contains parameterised concepts and assertions
        grouped by sections.
      </p>

      <h2>Workflow</h2>
      <ul>
        <li>
          First, select an expression template (the <b>Template</b> tab)
        </li>
        <li>
          Then fix argument values by choosing constituents from the current schema (the <b>Arguments</b> tab)
        </li>
        <li>Argument values are substituted into the expression, including adjustment of the parameter list</li>
        <li>
          If values are provided for all arguments, the type of the constituent to be created is updated automatically
        </li>
        <li>
          On the <b>Constituent</b> tab you can edit the attributes of the main (selected) constituent
        </li>
        <li>
          The <b>Create</b> button adds every required constituent to the schema (see below)
        </li>
      </ul>

      <h2>Which constituents are created</h2>
      <p>
        In addition to the selected template, the schema receives every term function and predicate function from the
        bank that is used in its expression and is not already present in the current schema. Constituents that already
        exist in the schema are not duplicated.
      </p>
      <p>
        Dependencies are inserted in an order that keeps references valid: auxiliary functions first, then the main
        constituent.
      </p>

      <h2>Argument substitution</h2>
      <p>
        Values chosen on the <b>Arguments</b> tab are propagated through nested calls to term functions and predicate
        functions from the bank: the corresponding schema globals are substituted into the parameters of auxiliary
        constituents.
      </p>
      <p>
        If all parameters of an auxiliary function receive values after substitution, it is created as a term or axiom;
        with partial substitution it remains a term function or predicate function with a shorter parameter list.
      </p>
      <p>References to bank names in formal definitions are replaced with new names generated in the target schema.</p>
    </>
  );
}
