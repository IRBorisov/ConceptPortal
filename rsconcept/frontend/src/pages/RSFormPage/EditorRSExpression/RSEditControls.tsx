import clsx from 'clsx';

import { TokenID } from '@/models/rslang';
import { PARAMETER, prefixes } from '@/utils/constants';

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
  TokenID.ITERATE,
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
  TokenID.ASSIGN,
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
    <div
      className={clsx(
        'max-w-[28rem] min-w-[28rem] xs:max-w-[38.5rem] xs:min-w-[38.5rem] sm:max-w-[40rem] sm:min-w-[40rem] md:max-w-fit mx-1 sm:mx-0',
        'flex-wrap',
        'divide-solid',
        'text-xs md:text-sm',
        'select-none'
      )}
      style={{
        transitionProperty: 'clipPath, height',
        transitionDuration: `${PARAMETER.moveDuration}ms`,
        clipPath: isOpen ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
        marginTop: isOpen ? '0.25rem' : '0rem',
        height: isOpen ? 'max-content' : '0rem'
      }}
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
          className='hidden xs:inline'
        />
      ))}

      {MAIN_SECOND_ROW.map(token => (
        <RSTokenButton key={`${prefixes.rsedit_btn}${token}`} token={token} onInsert={onEdit} disabled={disabled} />
      ))}
      {SECONDARY_SECOND_ROW.map(({ text, title }) => (
        <RSLocalButton
          key={`${prefixes.rsedit_btn}${title}`}
          className='hidden xs:inline'
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
          className='hidden xs:inline'
          text={text}
          title={title}
          onInsert={onEdit}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export default RSEditorControls;
