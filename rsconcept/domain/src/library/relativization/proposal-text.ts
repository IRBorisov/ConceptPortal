import { type RelativizationRole } from './engine';

export type TextLocale = 'en' | 'ru' | 'fr';

export interface ProposalFields {
  term_raw: string;
  definition_raw: string;
  convention: string;
}

interface TextInput {
  familyName: string;
  subject: string;
  isSet: boolean;
}

type Description = (input: { family: string; subject: string; isSet: boolean }) => string;

interface TextTemplates {
  quote: (name: string) => string;
  accessorName: string;
  accessorConvention: string;
  descriptions: Record<Exclude<RelativizationRole, 'preserved'>, Description>;
}

const text: Record<TextLocale, TextTemplates> = {
  ru: {
    quote: name => `«${name}»`,
    accessorName: 'Дерелятивизатор',
    accessorConvention:
      'Извлечение определено, если выбранному элементу сопоставлено ровно одно значение. Это может быть пустое множество',
    descriptions: {
      carrier: ({ family }) => `Общее множество, из которого выбираются подмножества для элементов семейства ${family}`,
      axis: ({ family, subject, isSet }) =>
        `Семейство ${family} состоит из допустимых ${
          isSet
            ? `подмножеств ${subject ? `множества ${subject}` : 'базисного множества'}`
            : `значений структуры${subject ? ` ${subject}` : ''}`
        }`,
      relation: ({ family, subject, isSet }) =>
        `Пары вида (элемент семейства ${family}, ${
          isSet
            ? `подмножество ${subject ? `множества ${subject}` : 'общего множества'}`
            : `соответствующее значение${subject ? ` ${subject}` : ''}`
        })`,
      family: ({ family, subject }) =>
        `Пары вида (элемент семейства ${family}, значение${subject ? ` терма ${subject}` : ''} для этого элемента)`,
      callable: ({ family }) => `Первый аргумент — элемент семейства ${family}`,
      condition: ({ family }) => `Условие выполняется для каждого элемента семейства ${family}`,
      accessor: ({ family }) => `Извлекает значение, сопоставленное заданному элементу семейства ${family}`
    }
  },
  en: {
    quote: name => `“${name}”`,
    accessorName: 'Derelativizer',
    accessorConvention:
      'Extraction is defined when exactly one value is associated with the selected member. The value may be an empty set',
    descriptions: {
      carrier: ({ family }) => `Common set from which subsets are selected for members of the family ${family}`,
      axis: ({ family, subject, isSet }) =>
        `The family ${family} consists of admissible ${
          isSet ? `subsets of ${subject || 'the base set'}` : `values of the structure${subject ? ` ${subject}` : ''}`
        }`,
      relation: ({ family, subject, isSet }) =>
        `Pairs of the form (member of the family ${family}, ${
          isSet ? `subset of ${subject || 'the common set'}` : `corresponding value${subject ? ` of ${subject}` : ''}`
        })`,
      family: ({ family, subject }) =>
        `Pairs of the form (member of the family ${family}, value${subject ? ` of ${subject}` : ''} for that member)`,
      callable: ({ family }) => `The first argument is a member of the family ${family}`,
      condition: ({ family }) => `The condition holds for every member of the family ${family}`,
      accessor: ({ family }) => `Retrieves the value associated with the given member of the family ${family}`
    }
  },
  fr: {
    quote: name => `« ${name} »`,
    accessorName: 'Fonction de dérélativisation',
    accessorConvention:
      'L’extraction est définie si une seule valeur est associée au membre choisi. Cette valeur peut être un ensemble vide',
    descriptions: {
      carrier: ({ family }) =>
        `Ensemble commun dans lequel sont choisis les sous-ensembles pour les membres de la famille ${family}`,
      axis: ({ family, subject, isSet }) =>
        `La famille ${family} est constituée ${
          isSet
            ? `des sous-ensembles admissibles de ${subject || 'l’ensemble de base'}`
            : `des valeurs admissibles de la structure${subject ? ` ${subject}` : ''}`
        }`,
      relation: ({ family, subject, isSet }) =>
        `Couples de la forme (membre de la famille ${family}, ${
          isSet
            ? `sous-ensemble de ${subject || 'l’ensemble commun'}`
            : `valeur correspondante${subject ? ` de ${subject}` : ''}`
        })`,
      family: ({ family, subject }) =>
        `Couples de la forme (membre de la famille ${family}, valeur${subject ? ` de ${subject}` : ''} pour ce membre)`,
      callable: ({ family }) => `Le premier argument est un membre de la famille ${family}`,
      condition: ({ family }) => `La condition est satisfaite pour chaque membre de la famille ${family}`,
      accessor: ({ family }) => `Extrait la valeur associée au membre donné de la famille ${family}`
    }
  }
};

function paragraphs(first: string, second: string): string {
  return first && second ? `${first}\n\n${second}` : first || second;
}

export function proposeText(
  role: RelativizationRole,
  original: ProposalFields,
  { familyName, subject, isSet }: TextInput,
  locale: TextLocale
): ProposalFields {
  if (role === 'preserved') return original;

  const templates = text[locale];
  const family = templates.quote(familyName);
  const description = templates.descriptions[role]({ family, subject: subject ? templates.quote(subject) : '', isSet });
  if (role === 'carrier') return { term_raw: original.term_raw, definition_raw: '', convention: description };
  if (role === 'accessor') {
    return {
      term_raw: `${templates.accessorName} (${familyName})`,
      definition_raw: description,
      convention: templates.accessorConvention
    };
  }

  const term = original.term_raw.trim();
  const term_raw = term ? `${term} (${familyName})` : role === 'axis' ? familyName : '';
  if (role === 'axis' || role === 'relation') {
    return { ...original, term_raw, convention: paragraphs(description, original.convention) };
  }
  return { ...original, term_raw, definition_raw: paragraphs(description, original.definition_raw) };
}
