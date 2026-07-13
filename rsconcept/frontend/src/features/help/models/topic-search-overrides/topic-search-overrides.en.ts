import { HelpTopic, type HelpTopic as HelpTopicValue } from '../help-topic';

import type { HelpSearchOverride } from './types';

export const topicSearchOverridesEn: Record<HelpTopicValue, HelpSearchOverride> = {
  [HelpTopic.MAIN]: {
    keywords: ['portal', 'help', 'manual', 'sections', 'support', 'documentation'],
    searchText:
      'General help for the Portal. Help sections, conceptual schemas, models, synthesis operations, support, licensing, and data processing policy.'
  },
  [HelpTopic.THESAURUS]: {
    keywords: ['thesaurus', 'terms', 'concepts', 'dictionary', 'definitions', 'constituent'],
    searchText:
      'Portal thesaurus. Core terms, concepts, definitions, conceptual schema, constituent, attributes, model, and operations.'
  },
  [HelpTopic.INTERFACE]: {
    keywords: [
      'interface',
      'navigation',
      'theme',
      'icons',
      'tooltips',
      'video',
      'menu',
      'tour',
      'guide',
      'tutorial',
      'onboarding',
      'walkthrough'
    ],
    searchText:
      'Portal user interface. Navigation, settings, light and dark theme, contextual help, interactive tours and guides, icons, video, and user menu.'
  },
  [HelpTopic.UI_LIBRARY]: {
    keywords: [
      'library',
      'schemas',
      'search',
      'context search',
      'metadata',
      'terms',
      'definitions',
      'filter',
      'folders',
      'explorer',
      'sorting'
    ],
    searchText:
      'Schema library. Metadata and context search across terms, definitions, and comments, filters, sorting, folder explorer, viewing conceptual schemas, OSS, and models.'
  },
  [HelpTopic.UI_SCHEMA_MENU]: {
    keywords: ['schema menu', 'schema editing', 'tabs', 'actions', 'commands'],
    searchText: 'Schema editing. Tabs, schema menu, schema actions, switching modes, and editing commands.'
  },
  [HelpTopic.UI_MODEL_MENU]: {
    keywords: ['model menu', 'model editing', 'model tabs', 'model actions', 'model commands'],
    searchText:
      'Model editing. Model tabs, model menu, recalculation, cloning, opening the schema, and moving the model to the sandbox.'
  },
  [HelpTopic.UI_SCHEMA_CARD]: {
    keywords: [
      'conceptual schema passport',
      'schema passport',
      'schema card',
      'schema attributes',
      'metadata',
      'properties'
    ],
    searchText:
      'Conceptual schema passport. Core attributes, management, properties, description, statistics, and other metadata.'
  },
  [HelpTopic.UI_SCHEMA_LIST]: {
    keywords: ['constituent list', 'table', 'constituents', 'schema list', 'rows', 'drag', 'reorder', 'selection'],
    searchText:
      'Schema constituent list. Table view, Ctrl/Cmd selection, drag-and-drop reordering, row selection, browsing and navigating constituents.'
  },
  [HelpTopic.UI_SCHEMA_EDITOR]: {
    keywords: ['constituent editor', 'editor', 'constituent', 'attributes', 'constituent list', 'sidebar', 'drag'],
    searchText:
      'Constituent editor. Editing attributes, sidebar list with drag reordering, management commands, editing concepts and properties.'
  },
  [HelpTopic.UI_MODEL_CARD]: {
    keywords: ['model passport', 'model card', 'model attributes', 'model'],
    searchText: 'Model passport. Core model properties and attributes, link to the schema, model management.'
  },
  [HelpTopic.UI_MODEL_LIST]: {
    keywords: ['model list', 'model constituents', 'model table', 'model elements'],
    searchText: 'Model constituent list. Tabular work with model composition, row management, viewing model data.'
  },
  [HelpTopic.UI_MODEL_VALUE]: {
    keywords: ['model data', 'values', 'data entry', 'editing values', 'value table'],
    searchText:
      'Model data. Entering, viewing, and editing values, working with model data, value and calculation table.'
  },
  [HelpTopic.UI_MODEL_VALUE_EDIT]: {
    keywords: ['value dialog', 'value', 'value editor', 'value view', 'value structure'],
    searchText: 'Value dialog. Structural view and edit of a single value, detailed work with a data element.'
  },
  [HelpTopic.UI_MODEL_EVALUATOR]: {
    keywords: ['expression evaluation', 'calculation', 'calculator', 'expression check', 'evaluation'],
    searchText:
      'Expression evaluation. Check and evaluate arbitrary expressions, run calculation, view results and statuses.'
  },
  [HelpTopic.UI_EVAL_STATUS]: {
    keywords: ['evaluation statuses', 'status', 'errors', 'calculation', 'notation'],
    searchText: 'Evaluation statuses. Notation for calculation states, errors, runs, and service statuses.'
  },
  [HelpTopic.UI_MODEL_BINDING]: {
    keywords: ['base interpretation', 'base interpretation editor', 'base set', 'model', 'text search'],
    searchText:
      'Base interpretation editor. Value table for primitive concepts, text search on elements, add and remove model rows.'
  },
  [HelpTopic.UI_GRAPH_TERM]: {
    keywords: ['term graph', 'graph', 'terms', 'nodes', 'edges', 'layout', 'axiomatic core', 'overview', 'focus'],
    searchText:
      'Term graph. Graph setup, axiomatic core overview, focus subgraph, editing nodes, edges, navigating the graph, and visual structure analysis.'
  },
  [HelpTopic.UI_FORMULA_TREE]: {
    keywords: ['parse tree', 'formula', 'syntax tree', 'expression nodes', 'ast'],
    searchText:
      'Expression parse tree. Node kinds, expression structure, syntax tree, viewing formulas and nested constructs.'
  },
  [HelpTopic.UI_TYPE_GRAPH]: {
    keywords: ['level graph', 'type graph', 'levels', 'types', 'node colors'],
    searchText: 'Type graph. Node colors, graph controls, viewing levels and relationships between types.'
  },
  [HelpTopic.UI_CST_STATUS]: {
    keywords: ['constituent status', 'status', 'notation', 'constituent'],
    searchText: 'Constituent status. Status notation and markers, meaning of marks, and interpreting states.'
  },
  [HelpTopic.UI_CST_CLASS]: {
    keywords: ['constituent class', 'class', 'notation', 'markers', 'constituent'],
    searchText: 'Constituent class. Class notation, markers, and differences between constituent kinds.'
  },
  [HelpTopic.UI_OSS_GRAPH]: {
    keywords: ['operational schema', 'oss', 'oss graph', 'operations', 'nodes', 'graph setup'],
    searchText:
      'Operational synthesis schema (OSS). Graph view of the OSS, graph setup, editing nodes, shared commands, and browsing operations.'
  },
  [HelpTopic.UI_OSS_SIDEBAR]: {
    keywords: ['sidebar', 'panel', 'operation', 'operation content', 'editing'],
    searchText:
      'Operational schema sidebar. Edit the content of the selected operation, view parameters and operation details.'
  },
  [HelpTopic.UI_OSS_CARD]: {
    keywords: ['oss passport', 'oss card', 'operational schema', 'oss attributes', 'metadata', 'operation statistics'],
    searchText:
      'OSS passport. Name, abbreviation, description, access and library location, operation statistics by type and attached schemas.'
  },
  [HelpTopic.UI_SUBSTITUTIONS]: {
    keywords: ['identifications', 'identification table', 'substitutions', 'matching', 'constituents'],
    searchText: 'Identification table. Match and identify constituents, manage substitutions and links.'
  },
  [HelpTopic.UI_RELOCATE_CST]: {
    keywords: ['move constituents', 'reorder', 'up', 'down', 'oss', 'constituents'],
    searchText:
      'Moving constituents within an operational schema. Move up and down, change constituent order and operation structure.'
  },
  [HelpTopic.UI_STRUCTURE_PLANNER]: {
    keywords: [
      'structure planner',
      'term structure',
      'typing',
      'structure graph',
      'constituent',
      'term',
      'tuple',
      'reduction'
    ],
    searchText:
      'Term structure planner. Graph of positions in the typing of a selected constituent, viewing a fragment of the formal definition, creating and editing terms at structure positions.'
  },
  [HelpTopic.CONCEPTUAL]: {
    keywords: ['conceptualization', 'theory', 'concepts', 'domain', 'schema'],
    searchText: 'Conceptualization. Portal foundations, domain concepts, schemas, models, and synthesis operations.'
  },
  [HelpTopic.CC_SYSTEM]: {
    keywords: ['conceptual schema', 'system of definitions', 'definitions', 'concepts', 'cs'],
    searchText:
      'Conceptual schema as a system of definitions. Concepts, definitions, formal schema structure, and organizing the domain.'
  },
  [HelpTopic.CC_RSMODEL]: {
    keywords: ['conceptual model', 'model', 'interpretation', 'data', 'instances'],
    searchText:
      'Conceptual model. Interpreted system of definitions, domain data, values, and the link between model and schema.'
  },
  [HelpTopic.CC_CONSTITUENTA]: {
    keywords: ['constituent attributes', 'constituent', 'attributes', 'primitive', 'derived'],
    searchText:
      'Constituent attributes. Primitive and derived concepts, constituent properties, description and attribute classification.'
  },
  [HelpTopic.CC_RELATIONS]: {
    keywords: ['links', 'relations', 'constituents', 'dependencies', 'inter-constituent links'],
    searchText:
      'Links between constituents. Relations, dependencies, structural links, and describing interactions between concepts.'
  },
  [HelpTopic.CC_SYNTHESIS]: {
    keywords: ['synthesis', 'schema merge', 'schema union', 'composition', 'conceptual schemas'],
    searchText:
      'Conceptual schema synthesis. Merging schemas, composing definitions, and building larger systems of concepts.'
  },
  [HelpTopic.CC_STRUCTURING]: {
    keywords: ['structuring', 'domain', 'decomposition', 'concept organization'],
    searchText:
      'Domain structuring. Splitting and organizing concepts, identifying entities, building formal structure.'
  },
  [HelpTopic.CC_OSS]: {
    keywords: ['operational synthesis schema', 'oss', 'operations', 'synthesis scenario', 'workflow'],
    searchText:
      'Operational synthesis schema. Describing the synthesis process, operations, inputs and outputs, step layout, and execution logic.'
  },
  [HelpTopic.CC_PROPAGATION]: {
    keywords: ['end-to-end changes', 'change propagation', 'changes', 'propagation', 'oss'],
    searchText:
      'End-to-end changes in an operational schema. Propagating changes across linked entities, data consistency, and dependencies.'
  },
  [HelpTopic.RSLANG]: {
    keywords: ['rslang', 'rodo-structural explication', 'language', 'expressions', 'syntax', 'semantics'],
    searchText:
      'RSLang — language of rodo-structural explication. Portal expression language, syntax, semantics, typing, interpretation, and templates.'
  },
  [HelpTopic.RSL_LITERALS]: {
    keywords: ['identifiers', 'literals', 'names', 'numbers', 'strings', 'naming rules'],
    searchText: 'Identifiers and literals. Identifier rules, literals, naming entities, and basic language elements.'
  },
  [HelpTopic.RSL_TYPIFICATION]: {
    keywords: ['typing', 'types', 'genera', 'levels', 'type system'],
    searchText: 'Typing. Type system in genus-structure explication, levels, compatibility rules, and describing types.'
  },
  [HelpTopic.RSL_EXPRESSION_LOGIC]: {
    keywords: ['logical expressions', 'predicates', 'logic', 'truth', 'conditions', 'boolean'],
    searchText:
      'Logical expressions. Predicates, logical connectives, conditions, comparison, truth, and checking logical constructs.'
  },
  [HelpTopic.RSL_EXPRESSION_SET]: {
    keywords: ['set-theoretic expressions', 'sets', 'union', 'intersection', 'membership'],
    searchText: 'Set-theoretic expressions. Basic set operations, membership, union, intersection, and examples.'
  },
  [HelpTopic.RSL_EXPRESSION_STRUCTURE]: {
    keywords: ['structural expressions', 'structures', 'tuples', 'fields', 'building structures'],
    searchText:
      'Structural expressions. Building structures, element access, derived structures, and object composition.'
  },
  [HelpTopic.RSL_EXPRESSION_ARITHMETIC]: {
    keywords: ['arithmetic expressions', 'arithmetic', 'numbers', 'comparison', 'operations'],
    searchText:
      'Arithmetic expressions. Basic arithmetic, comparison operations, calculations, and numeric expressions.'
  },
  [HelpTopic.RSL_EXPRESSION_QUANTOR]: {
    keywords: ['quantified expressions', 'quantifiers', 'forall', 'exists', 'variables'],
    searchText: 'Quantified expressions. Quantifier syntax and semantics, forall and exists constructs, variable scope.'
  },
  [HelpTopic.RSL_EXPRESSION_DECLARATIVE]: {
    keywords: ['declarative expressions', 'declarative', 'description', 'declaration'],
    searchText: 'Declarative expressions. Syntax, semantics, and ways to describe objects and properties declaratively.'
  },
  [HelpTopic.RSL_EXPRESSION_IMPERATIVE]: {
    keywords: ['imperative expressions', 'actions', 'action blocks', 'commands', 'sequence'],
    searchText: 'Imperative expressions. Syntax, action blocks, operation sequences, and execution control.'
  },
  [HelpTopic.RSL_EXPRESSION_RECURSIVE]: {
    keywords: ['iterative constructs', 'recursion', 'loop', 'iteration', 'repetition'],
    searchText:
      'Iterative constructs. Loop and recursive expression syntax, construct composition, repetition, and evaluation.'
  },
  [HelpTopic.RSL_EXPRESSION_PARAMETER]: {
    keywords: [
      'parameterized expressions',
      'parameters',
      'term function',
      'predicate function',
      'arguments',
      'template',
      'radical',
      'typification checking'
    ],
    searchText:
      'Parameterized expressions. Declaring term and predicate functions, parameters, arguments, template radical typification, and reuse.'
  },
  [HelpTopic.RSL_CORRECT]: {
    keywords: ['portability', 'correctness', 'validity', 'compatibility', 'checking'],
    searchText:
      'Portability and correctness. Expression correctness requirements, definition compatibility, and language limits.'
  },
  [HelpTopic.RSL_INTERPRET]: {
    keywords: ['interpretability', 'interpretation', 'expression meaning', 'semantics'],
    searchText: 'Interpretability. Interpreting definitions and claims, expression semantics, and ties to the domain.'
  },
  [HelpTopic.RSL_OPERATIONS]: {
    keywords: ['schema operations', 'operations', 'schemas', 'transformations', 'schema actions'],
    searchText:
      'Operations on conceptual schemas. Formal operations, schema transforms, applying rules, and changing structure.'
  },
  [HelpTopic.RSL_TEMPLATES]: {
    keywords: [
      'templates',
      'expression bank',
      'term functions',
      'predicate functions',
      'dependencies',
      'argument substitution',
      'reuse'
    ],
    searchText:
      'Templates and expression bank. Creating constituents from a template with term functions and predicate functions, chained argument substitution, dependency order.'
  },
  [HelpTopic.TERM_CONTROL]: {
    keywords: ['terminology', 'terms', 'term control', 'references', 'text references'],
    searchText:
      'Terminology control. Managing terms and textual references, terminology consistency, and linking text to schemas.'
  },
  [HelpTopic.ACCESS]: {
    keywords: ['access', 'permissions', 'roles', 'owner', 'editor', 'rights'],
    searchText: 'Access management. User rights, owner and editor roles, permission setup, and collaboration.'
  },
  [HelpTopic.VERSIONS]: {
    keywords: ['versions', 'versioning', 'history', 'restore', 'changes', 'revisions'],
    searchText: 'Schema versioning. Change history, version actions, restore, and revision management.'
  },
  [HelpTopic.ASSISTANT]: {
    keywords: [
      'ai assistant',
      'assistant',
      'artificial intelligence',
      'prompt',
      'queries',
      'hints',
      'rstool',
      'mcp',
      'ai agent',
      'agent'
    ],
    searchText:
      'AI assistant. Working with the intelligent assistant, queries, hint generation, rstool and MCP for external AI agents.'
  },
  [HelpTopic.INFO]: {
    keywords: ['documentation', 'reference', 'documents', 'rules', 'api', 'policy'],
    searchText:
      'Reference information and documents. Conduct rules, acknowledgements, data processing policy, REST API, and technical documentation.'
  },
  [HelpTopic.INFO_RULES]: {
    keywords: ['rules', 'conduct', 'participants', 'code', 'norms', 'prohibitions'],
    searchText:
      'Portal participant conduct rules. Expected behavior, unacceptable behavior, interaction norms, and responsibility.'
  },
  [HelpTopic.CONTRIBUTORS]: {
    keywords: ['acknowledgements', 'developers', 'researchers', 'authors', 'contributions'],
    searchText:
      'Acknowledgements to developers and researchers. Project participants, contributions to the Portal, and recognizing authors.'
  },
  [HelpTopic.INFO_PRIVACY]: {
    keywords: ['data policy', 'personal data', 'confidentiality', 'privacy', 'data'],
    searchText:
      'Personal data processing policy. Confidentiality, data processing, user rights, and information storage rules.'
  },
  [HelpTopic.INFO_API]: {
    keywords: ['programmatic interface', 'api', 'rest api', 'developer', 'integration', 'endpoints'],
    searchText:
      'Portal programmatic interface. REST API, integrations, developer workflows, endpoints, and technical integration.'
  },
  [HelpTopic.EXTEOR]: {
    keywords: ['exteor', 'windows', 'program', 'explication', 'desktop application'],
    searchText:
      'Exteor for Windows. Core program features, working with theory explication, and using the desktop application.'
  }
};
