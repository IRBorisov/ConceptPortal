// Formatted text editing helpers

import { type ReactCodeMirrorRef, type SelectionRange } from '@uiw/react-codemirror';

import { CodeMirrorWrapper } from '@/utils/codemirror';

import { TokenID } from '../../backend/types';

export function getSymbolSubstitute(keyCode: string, shiftPressed: boolean): string | undefined {
  // prettier-ignore
  if (shiftPressed) {
    switch (keyCode) {
    case 'Backquote':     return '∃';
    case 'Backslash':     return '|';
    case 'BracketLeft':   return '{';
    case 'BracketRight':  return '}';
    case 'Comma':         return '<';
    case 'Period':        return '>';

    case 'Digit8': return '×';
    case 'KeyB': return 'ℬ';
    case 'KeyZ': return 'Z';
    case 'KeyR': return 'R';
    case 'KeyF': return 'F';
    case 'KeyP': return 'P';
    case 'KeyX': return 'X';
    case 'KeyS': return 'S';
    case 'KeyD': return 'D';
    case 'KeyC': return 'C';
    }
  } else {
    switch (keyCode) {
    case 'Backquote': return '∀';

    case 'KeyQ': return 'μ';
    case 'KeyW': return 'ω';
    case 'KeyE': return 'ε';
    case 'KeyR': return 'ρ';
    case 'KeyT': return 'τ';
    case 'KeyY': return 'π';

    case 'KeyA': return 'α';
    case 'KeyS': return 'σ';
    case 'KeyD': return 'δ';
    case 'KeyF': return 'φ';
    case 'KeyG': return 'γ';
    case 'KeyH': return 'λ';

    case 'KeyZ': return 'ζ';
    case 'KeyX': return 'ξ';
    case 'KeyC': return 'ψ';
    case 'KeyV': return 'θ';
    case 'KeyB': return 'β';
    case 'KeyN': return 'η';

    case 'BracketLeft': return '[';
    case 'BracketRight': return ']';
    case 'Comma': return ',';
    }
  }
  return undefined;
}

/**
 * Wrapper class for RSLang editor.
 */
export class RSTextWrapper extends CodeMirrorWrapper {
  constructor(object: Required<ReactCodeMirrorRef>) {
    super(object);
  }

  insertToken(tokenID: TokenID): boolean {
    const selection = this.getSelection();
    const hasSelection = selection.from !== selection.to;
    switch (tokenID) {
      case TokenID.NT_DECLARATIVE_EXPR: {
        if (hasSelection) {
          this.envelopeWith('D{ξ∈X1 | ', '}');
        } else {
          this.envelopeWith('D{ξ∈X1 | P1[ξ]', '}');
        }
        this.ref.view.dispatch({
          selection: {
            anchor: selection.from + 2
          }
        });
        return true;
      }
      case TokenID.NT_IMPERATIVE_EXPR: {
        if (hasSelection) {
          this.envelopeWith('I{(σ, γ) | σ:∈X1; γ:=F1[σ]; ', '}');
        } else {
          this.envelopeWith('I{(σ, γ) | σ:∈X1; γ:=F1[σ]; P1[σ, γ]', '}');
        }
        return true;
      }
      case TokenID.NT_RECURSIVE_FULL: {
        if (hasSelection) {
          this.envelopeWith('R{ξ:=D1 | F1[ξ]≠∅ | ', '}');
        } else {
          this.envelopeWith('R{ξ:=D1 | F1[ξ]≠∅ | ξ∪F1[ξ]', '}');
        }
        return true;
      }
      case TokenID.BIGPR:
        this.envelopeWith('Pr1(', ')');
        return true;
      case TokenID.SMALLPR:
        this.envelopeWith('pr1(', ')');
        return true;
      case TokenID.FILTER:
        this.envelopeWith('Fi1[α](', ')');
        return true;
      case TokenID.REDUCE:
        this.envelopeWith('red(', ')');
        return true;
      case TokenID.CARD:
        this.envelopeWith('card(', ')');
        return true;
      case TokenID.BOOL:
        this.envelopeWith('bool(', ')');
        return true;
      case TokenID.DEBOOL:
        this.envelopeWith('debool(', ')');
        return true;

      case TokenID.PUNCTUATION_PL: {
        this.envelopeWith('(', ')');
        this.ref.view.dispatch({
          selection: {
            anchor: hasSelection ? selection.to : selection.from + 1
          }
        });
        return true;
      }
      case TokenID.PUNCTUATION_SL: {
        this.envelopeWith('[', ']');
        if (hasSelection) {
          this.ref.view.dispatch({
            selection: {
              anchor: hasSelection ? selection.to : selection.from + 1
            }
          });
        }
        return true;
      }
      case TokenID.BOOLEAN: {
        if (hasSelection && this.startsWithBoolean(selection)) {
          this.envelopeWith('ℬ', '');
        } else {
          this.envelopeWith('ℬ(', ')');
        }
        return true;
      }

      case TokenID.DECART:
        this.replaceWith('×');
        return true;
      case TokenID.QUANTOR_UNIVERSAL:
        this.replaceWith('∀');
        return true;
      case TokenID.QUANTOR_EXISTS:
        this.replaceWith('∃');
        return true;
      case TokenID.SET_IN:
        this.replaceWith('∈');
        return true;
      case TokenID.SET_NOT_IN:
        this.replaceWith('∉');
        return true;
      case TokenID.LOGIC_OR:
        this.replaceWith('∨');
        return true;
      case TokenID.LOGIC_AND:
        this.replaceWith('&');
        return true;
      case TokenID.SUBSET_OR_EQ:
        this.replaceWith('⊆');
        return true;
      case TokenID.LOGIC_IMPLICATION:
        this.replaceWith('⇒');
        return true;
      case TokenID.SET_INTERSECTION:
        this.replaceWith('∩');
        return true;
      case TokenID.SET_UNION:
        this.replaceWith('∪');
        return true;
      case TokenID.SET_MINUS:
        this.replaceWith('\\');
        return true;
      case TokenID.SET_SYMMETRIC_MINUS:
        this.replaceWith('∆');
        return true;
      case TokenID.LIT_EMPTYSET:
        this.replaceWith('∅');
        return true;
      case TokenID.LIT_WHOLE_NUMBERS:
        this.replaceWith('Z');
        return true;
      case TokenID.SUBSET:
        this.replaceWith('⊂');
        return true;
      case TokenID.NOT_SUBSET:
        this.replaceWith('⊄');
        return true;
      case TokenID.EQUAL:
        this.replaceWith('=');
        return true;
      case TokenID.NOTEQUAL:
        this.replaceWith('≠');
        return true;
      case TokenID.LOGIC_NOT:
        this.replaceWith('¬');
        return true;
      case TokenID.LOGIC_EQUIVALENT:
        this.replaceWith('⇔');
        return true;
      case TokenID.GREATER_OR_EQ:
        this.replaceWith('≥');
        return true;
      case TokenID.LESSER_OR_EQ:
        this.replaceWith('≤');
        return true;
      case TokenID.ASSIGN:
        this.replaceWith(':=');
        return true;
      case TokenID.ITERATE:
        this.replaceWith(':∈');
        return true;
      case TokenID.MULTIPLY:
        this.replaceWith('*');
        return true;
    }
    return false;
  }

  processAltKey(keyCode: string, shiftPressed: boolean): boolean {
    // prettier-ignore
    if (shiftPressed) {
      switch (keyCode) {
        case 'KeyE': return this.insertToken(TokenID.DECART);

        case 'Backquote': return this.insertToken(TokenID.NOTEQUAL);
        case 'Digit1': return this.insertToken(TokenID.SET_NOT_IN); // !
        case 'Digit2': return this.insertToken(TokenID.NOT_SUBSET); // @
        case 'Digit3': return this.insertToken(TokenID.LOGIC_OR); // #
        case 'Digit4': return this.insertToken(TokenID.LOGIC_EQUIVALENT); // $
        case 'Digit5': return this.insertToken(TokenID.SET_SYMMETRIC_MINUS); // %
        case 'Digit6': return this.insertToken(TokenID.ASSIGN); // ^
        case 'Digit7': return this.insertToken(TokenID.GREATER_OR_EQ); // &
        case 'Digit8': return this.insertToken(TokenID.LESSER_OR_EQ); // *
        case 'Digit9': return this.insertToken(TokenID.PUNCTUATION_PL); // (
      }
    } else {
      switch (keyCode) {
        case 'KeyQ': return this.insertToken(TokenID.BIGPR);
        case 'KeyW': return this.insertToken(TokenID.SMALLPR);
        case 'KeyE': return this.insertToken(TokenID.BOOLEAN);
        case 'KeyR': return this.insertToken(TokenID.REDUCE);
        case 'KeyT': return this.insertToken(TokenID.NT_RECURSIVE_FULL);
        case 'KeyA': return this.insertToken(TokenID.SET_INTERSECTION);
        case 'KeyS': return this.insertToken(TokenID.SET_UNION);
        case 'KeyD': return this.insertToken(TokenID.NT_DECLARATIVE_EXPR);
        case 'KeyF': return this.insertToken(TokenID.FILTER);
        case 'KeyG': return this.insertToken(TokenID.NT_IMPERATIVE_EXPR);
        case 'KeyZ': return this.insertToken(TokenID.LIT_WHOLE_NUMBERS);
        case 'KeyX': return this.insertToken(TokenID.LIT_EMPTYSET);
        case 'KeyC': return this.insertToken(TokenID.CARD);
        case 'KeyV': return this.insertToken(TokenID.DEBOOL);
        case 'KeyB': return this.insertToken(TokenID.BOOL);

        case 'Backquote': return this.insertToken(TokenID.LOGIC_NOT);
        case 'Digit1': return this.insertToken(TokenID.SET_IN);
        case 'Digit2': return this.insertToken(TokenID.SUBSET_OR_EQ);
        case 'Digit3': return this.insertToken(TokenID.LOGIC_AND);
        case 'Digit4': return this.insertToken(TokenID.LOGIC_IMPLICATION);
        case 'Digit5': return this.insertToken(TokenID.SET_MINUS);
        case 'Digit6': return this.insertToken(TokenID.ITERATE);
        case 'Digit7': return this.insertToken(TokenID.SUBSET);
        case 'Digit8': return this.insertToken(TokenID.MULTIPLY);
        case 'BracketLeft': return this.insertToken(TokenID.PUNCTUATION_SL);
      }
    }
    return false;
  }

  private startsWithBoolean(range: SelectionRange): boolean {
    const text = this.ref.view.state.sliceDoc(range.from, range.to);
    if (!text.startsWith('ℬ') || !text.endsWith(')')) {
      return false;
    }
    const openParenIndex = text.indexOf('(', 1);
    if (openParenIndex === -1) {
      return false;
    }
    for (const char of text.slice(0, openParenIndex)) {
      if (char !== 'ℬ') {
        return false;
      }
    }
    const bracketsContent = text.slice(openParenIndex + 1, text.length - 1);
    return this.isValidBracketSequence(bracketsContent);
  }

  private isValidBracketSequence(text: string): boolean {
    let depth = 0;
    for (const char of text) {
      if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
        if (depth < 0) return false;
      }
    }
    return depth === 0;
  }
}
