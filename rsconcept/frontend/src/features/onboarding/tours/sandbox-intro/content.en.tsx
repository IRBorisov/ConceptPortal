import { type TourStepContent } from '../../models/tour';

export const sandboxIntroContentEn: Record<string, TourStepContent> = {
  welcome: {
    title: 'Welcome to the Sandbox',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          The Sandbox is a demo environment that works without registration. It contains a small conceptual schema
          together with a model, stored locally in your browser.
        </p>
        <p>
          This short tour walks through the editor tabs and shows how a <b>schema</b> defines concepts and their
          relationships, while a <b>model</b> provides concrete values and evaluation results.
        </p>
      </div>
    )
  },
  passport: {
    title: 'Passport',
    body: (
      <p>
        The passport names your schema and model: title, alias, and description. Every item in the Portal library has
        one. Next we will look at the concepts themselves.
      </p>
    )
  },
  list: {
    title: 'Constituents list',
    body: (
      <p>
        Constituents are the building blocks of a schema: base sets, terms, definitions, and axioms. The list shows
        their aliases, terms, and formal definitions in one table.
      </p>
    )
  },
  concept: {
    title: 'Concept editor',
    body: (
      <p>
        Here a single constituent is edited: its term, textual definition, and formal definition. Select constituents
        in the list to open them on this tab. In the Sandbox you can experiment freely — data stays local.
      </p>
    )
  },
  graph: {
    title: 'Term graph',
    body: (
      <p>
        The graph visualizes relationships between concepts: which definitions depend on which. It helps to see the
        structure of the schema as a whole.
      </p>
    )
  },
  data: {
    title: 'Model data',
    body: (
      <p>
        This is where the schema meets the model: base sets receive concrete elements. The schema defines the
        structure, and the model fills it with values from a subject domain.
      </p>
    )
  },
  evaluation: {
    title: 'Evaluation',
    body: (
      <p>
        Definitions are computed over the model data. Here you can inspect calculated values and issues — for example,
        expressions that cannot be evaluated with the current data.
      </p>
    )
  },
  finish: {
    title: 'You are all set',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          That is the core loop: define concepts in the schema, provide data in the model, and inspect evaluation
          results.
        </p>
        <p>Explore the Sandbox freely — you can always restore the initial data from the menu, or read the manuals.</p>
      </div>
    )
  }
};
