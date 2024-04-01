import { motion } from 'framer-motion';

import { TokenID } from '@/models/rslang';
import { animateRSControl } from '@/styling/animations';
import { prefixes } from '@/utils/constants';

import RSLocalButton from './RSLocalButton';
import RSTokenButton from './RSTokenButton';

const MAIN_FIRST_ROW: TokenID[] = [
  TokenID.NT_DECLARATIVE_EXPR,
  TokenID.NT_IMPERATIVE_EXPR,
  TokenID.NT_RECURSIVE_FULL,
  TokenID.BIGPR,
  TokenID.SMALLPR,
  TokenID.FILTER,
  TokenID.REDUCE,
  TokenID.CARD,
  TokenID.BOOL
];

const MAIN_SECOND_ROW: TokenID[] = [
  TokenID.BOOLEAN,
  TokenID.PUNCTUATION_PL,
  TokenID.SET_INTERSECTION,
  TokenID.LIT_EMPTYSET,
  TokenID.QUANTOR_UNIVERSAL,
  TokenID.LOGIC_NOT,
  TokenID.SET_IN,
  TokenID.SUBSET_OR_EQ,
  TokenID.LOGIC_AND,
  TokenID.LOGIC_IMPLICATION,
  TokenID.SET_MINUS,
  TokenID.PUNCTUATION_ITERATE,
  TokenID.SUBSET,
  TokenID.DEBOOL
];

const MAIN_THIRD_ROW: TokenID[] = [
  TokenID.DECART,
  TokenID.PUNCTUATION_SL,
  TokenID.SET_UNION,
  TokenID.LIT_WHOLE_NUMBERS,
  TokenID.QUANTOR_EXISTS,
  TokenID.NOTEQUAL,
  TokenID.SET_NOT_IN,
  TokenID.NOT_SUBSET,
  TokenID.LOGIC_OR,
  TokenID.LOGIC_EQUIVALENT,
  TokenID.SET_SYMMETRIC_MINUS,
  TokenID.PUNCTUATION_ASSIGN,
  TokenID.MULTIPLY,
  TokenID.GREATER_OR_EQ,
  TokenID.LESSER_OR_EQ
];

const SECONDARY_FIRST_ROW = [
  { text: 'μ', title: 'q' },
  { text: 'ω', title: 'w' },
  { text: 'ε', title: 'e' },
  { text: 'ρ', title: 'r' },
  { text: 'τ', title: 't' },
  { text: 'π', title: 'y' }
];

const SECONDARY_SECOND_ROW = [
  { text: 'α', title: 'a' },
  { text: 'σ', title: 's' },
  { text: 'δ', title: 'd' },
  { text: 'φ', title: 'f' },
  { text: 'γ', title: 'g' },
  { text: 'λ', title: 'h' }
];

const SECONDARY_THIRD_ROW = [
  { text: 'ζ', title: 'z' },
  { text: 'ξ', title: 'x' },
  { text: 'ψ', title: 'c' },
  { text: 'θ', title: 'v' },
  { text: 'β', title: 'b' },
  { text: 'η', title: 'n' }
];

interface RSEditorControlsProps {
  isOpen: boolean;
  disabled?: boolean;
  onEdit: (id: TokenID, key?: string) => void;
}

function RSEditorControls({ isOpen, disabled, onEdit }: RSEditorControlsProps) {
  return (
    <motion.div
      className='flex-wrap text-xs select-none sm:text-sm divide-solid'
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      variants={animateRSControl}
    >
      {MAIN_FIRST_ROW.map(token => (
        <RSTokenButton key={`${prefixes.rsedit_btn}${token}`} token={token} onInsert={onEdit} disabled={disabled} />
      ))}
      {SECONDARY_FIRST_ROW.map(({ text, title }) => (
        <RSLocalButton
          key={`${prefixes.rsedit_btn}${title}`}
          text={text}
          title={title}
          onInsert={onEdit}
          disabled={disabled}
        />
      ))}

      {MAIN_SECOND_ROW.map(token => (
        <RSTokenButton key={`${prefixes.rsedit_btn}${token}`} token={token} onInsert={onEdit} disabled={disabled} />
      ))}
      {SECONDARY_SECOND_ROW.map(({ text, title }) => (
        <RSLocalButton
          key={`${prefixes.rsedit_btn}${title}`}
          text={text}
          title={title}
          onInsert={onEdit}
          disabled={disabled}
        />
      ))}

      {MAIN_THIRD_ROW.map(token => (
        <RSTokenButton key={`${prefixes.rsedit_btn}${token}`} token={token} onInsert={onEdit} disabled={disabled} />
      ))}
      {SECONDARY_THIRD_ROW.map(({ text, title }) => (
        <RSLocalButton
          key={`${prefixes.rsedit_btn}${title}`}
          text={text}
          title={title}
          onInsert={onEdit}
          disabled={disabled}
        />
      ))}
    </motion.div>
  );
}

export default RSEditorControls;
