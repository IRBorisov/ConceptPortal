import clsx from 'clsx';

import { TokenID } from '@/features/rslang/types';

import { prefixes } from '@/utils/constants';

import { RSLocalButton } from './rs-local-button';
import { RSTokenButton } from './rs-token-button';

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
  { text: 'μ', hotkey: 'q' },
  { text: 'ω', hotkey: 'w' },
  { text: 'ε', hotkey: 'e' },
  { text: 'ρ', hotkey: 'r' },
  { text: 'τ', hotkey: 't' },
  { text: 'π', hotkey: 'y' }
];

const SECONDARY_SECOND_ROW = [
  { text: 'α', hotkey: 'a' },
  { text: 'σ', hotkey: 's' },
  { text: 'δ', hotkey: 'd' },
  { text: 'φ', hotkey: 'f' },
  { text: 'γ', hotkey: 'g' },
  { text: 'λ', hotkey: 'h' }
];

const SECONDARY_THIRD_ROW = [
  { text: 'ζ', hotkey: 'z' },
  { text: 'ξ', hotkey: 'x' },
  { text: 'ψ', hotkey: 'c' },
  { text: 'θ', hotkey: 'v' },
  { text: 'β', hotkey: 'b' },
  { text: 'η', hotkey: 'n' }
];

interface RSEditorControlsProps {
  isOpen: boolean;
  disabled?: boolean;
  onEdit: (id: TokenID, key?: string) => void;
}

export function RSEditorControls({ isOpen, disabled, onEdit }: RSEditorControlsProps) {
  return (
    <div
      className={clsx(
        'cc-rs-edit-controls',
        'max-w-md min-w-md xs:max-w-154 xs:min-w-154 sm:max-w-160 sm:min-w-160 md:max-w-fit mx-1 sm:mx-0',
        'flex flex-wrap',
        'text-xs md:text-sm',
        'select-none',
        isOpen && 'open'
      )}
      aria-hidden={!isOpen}
    >
      {MAIN_FIRST_ROW.map(token => (
        <RSTokenButton key={`${prefixes.rsedit_btn}${token}`} token={token} onInsert={onEdit} disabled={disabled} />
      ))}
      {SECONDARY_FIRST_ROW.map(({ text, hotkey }) => (
        <RSLocalButton
          key={`${prefixes.rsedit_btn}${hotkey}`}
          text={text}
          titleHtml={`<kbd>[${hotkey}]</kbd>`}
          className='hidden xs:inline'
          onInsert={onEdit}
          disabled={disabled}
        />
      ))}

      {MAIN_SECOND_ROW.map(token => (
        <RSTokenButton key={`${prefixes.rsedit_btn}${token}`} token={token} onInsert={onEdit} disabled={disabled} />
      ))}
      {SECONDARY_SECOND_ROW.map(({ text, hotkey }) => (
        <RSLocalButton
          key={`${prefixes.rsedit_btn}${hotkey}`}
          className='hidden xs:inline'
          text={text}
          titleHtml={`<kbd>[${hotkey}]</kbd>`}
          onInsert={onEdit}
          disabled={disabled}
        />
      ))}

      {MAIN_THIRD_ROW.map(token => (
        <RSTokenButton key={`${prefixes.rsedit_btn}${token}`} token={token} onInsert={onEdit} disabled={disabled} />
      ))}
      {SECONDARY_THIRD_ROW.map(({ text, hotkey }) => (
        <RSLocalButton
          key={`${prefixes.rsedit_btn}${hotkey}`}
          className='hidden xs:inline'
          text={text}
          titleHtml={`<kbd>[${hotkey}]</kbd>`}
          onInsert={onEdit}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
