import { TokenID } from '../../../models/rslang';
import { prefixes } from '../../../utils/constants';
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
  TokenID.PUNC_PL,
  TokenID.INTERSECTION,
  TokenID.LIT_EMPTYSET,
  TokenID.FORALL,
  TokenID.NOT,
  TokenID.IN,
  TokenID.SUBSET_OR_EQ,
  TokenID.AND,
  TokenID.IMPLICATION,
  TokenID.SET_MINUS,
  TokenID.PUNC_ITERATE,
  TokenID.SUBSET,
  TokenID.DEBOOL
];

const MAIN_THIRD_ROW: TokenID[] = [
  TokenID.DECART,
  TokenID.PUNC_SL,
  TokenID.UNION,
  TokenID.LIT_INTSET,
  TokenID.EXISTS,
  TokenID.NOTEQUAL,
  TokenID.NOTIN,
  TokenID.NOTSUBSET,
  TokenID.OR,
  TokenID.EQUIVALENT,
  TokenID.SYMMINUS,
  TokenID.PUNC_ASSIGN,
  TokenID.EQUAL,
  TokenID.GREATER_OR_EQ,
  TokenID.LESSER_OR_EQ
];

const SECONDARY_FIRST_ROW = [
  {text: 'μ', tooltip: 'q'},
  {text: 'ω', tooltip: 'w'},
  {text: 'ε', tooltip: 'e'},
  {text: 'ρ', tooltip: 'r'},
  {text: 'τ', tooltip: 't'},
  {text: 'π', tooltip: 'y'}
];

const SECONDARY_SECOND_ROW = [
  {text: 'α', tooltip: 'a'},
  {text: 'σ', tooltip: 's'},
  {text: 'δ', tooltip: 'd'},
  {text: 'φ', tooltip: 'f'},
  {text: 'γ', tooltip: 'g'},
  {text: 'λ', tooltip: 'h'}
];

const SECONDARY_THIRD_ROW = [
  {text: 'ζ', tooltip: 'z'},
  {text: 'ξ', tooltip: 'x'},
  {text: 'ψ', tooltip: 'c'},
  {text: 'θ', tooltip: 'v'},
  {text: 'β', tooltip: 'b'},
  {text: 'η', tooltip: 'n'}
];

interface RSEditorControlsProps {
  onEdit: (id: TokenID, key?: string) => void
  disabled?: boolean
}

function RSEditorControls({ onEdit, disabled }: RSEditorControlsProps) {
  return (
  <div className='flex items-center justify-between w-full text-sm'>
    <div className='border-r w-fit'>
      <div className='flex justify-start'>
        {MAIN_FIRST_ROW.map(
        (token) => 
        <RSTokenButton key={`${prefixes.rsedit_btn}${token}`}
          token={token} onInsert={onEdit} disabled={disabled}
        />)}
      </div>
      <div className='flex justify-start'>
        {MAIN_SECOND_ROW.map(
        (token) => 
        <RSTokenButton key={`${prefixes.rsedit_btn}${token}`}
          token={token} onInsert={onEdit} disabled={disabled}
        />)}
      </div>
      <div className='flex justify-start'>
        {MAIN_THIRD_ROW.map(
        (token) => 
        <RSTokenButton key={`${prefixes.rsedit_btn}${token}`}
          token={token} onInsert={onEdit} disabled={disabled}
        />)}
      </div>
    </div>

    <div className='border-l w-fit'>
      <div className='flex justify-start'>
        {SECONDARY_FIRST_ROW.map(
        ({text, tooltip}) => 
        <RSLocalButton key={`${prefixes.rsedit_btn}${tooltip}`}
          text={text} tooltip={tooltip} onInsert={onEdit} disabled={disabled}
        />)}
      </div>
      <div className='flex justify-start'>
        {SECONDARY_SECOND_ROW.map(
        ({text, tooltip}) => 
        <RSLocalButton key={`${prefixes.rsedit_btn}${tooltip}`}
          text={text} tooltip={tooltip} onInsert={onEdit} disabled={disabled}
        />)}
      </div>
      <div className='flex justify-start'>
        {SECONDARY_THIRD_ROW.map(
        ({text, tooltip}) => 
        <RSLocalButton key={`${prefixes.rsedit_btn}${tooltip}`}
          text={text} tooltip={tooltip} onInsert={onEdit} disabled={disabled}
        />)}
      </div>
    </div>
  </div>);
}

export default RSEditorControls;