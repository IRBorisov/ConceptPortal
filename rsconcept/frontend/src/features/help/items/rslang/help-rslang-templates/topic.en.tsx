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
      <ul>
        <li>First, select an expression template (Template tab)</li>
        <li>
          Then, for the arguments, you can fix values by selecting from the current schema's constituents or specifying
          expressions (Arguments tab)
        </li>
        <li>Argument values will be substituted into the expression, including adjusting the argument list</li>
        <li>If values are provided for all arguments, the type of the constituent to be created is updated automatically</li>
        <li>On the Constituent tab, you can adjust all attributes of the constituent being created</li>
        <li>
          The <b>Create</b> button initiates adding the selected constituent to the schema
        </li>
      </ul>
    </>
  );
}
