// Formatted text editing helpers

import { ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { TokenID } from '../../models/rslang';
import { CodeMirrorWrapper } from '../../utils/codemirror';

export function getSymbolSubstitute(keyCode: string, shiftPressed: boolean): string | undefined {
  if (shiftPressed) {
    switch (keyCode) {
    case 'Backquote': return '∃';
    }
  } else {
    switch (keyCode) {
    case 'Backquote': return '∀';

    // qwerty = μωερτπ
    //  asdfgh = ασδφγλ
    //   zxcvbn = ζξψθβη
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
    const hasSelection = selection.from !== selection.to
    switch (tokenID) {
    case TokenID.NT_DECLARATIVE_EXPR: {
      if (hasSelection) {
        this.envelopeWith('D{ξ∈X1 | ', '}');
      } else {
        this.envelopeWith('D{ξ∈X1 | P1[ξ]', '}');
      }
      this.ref.view.dispatch({
        selection: {
          anchor: selection.from + 2,
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
    case TokenID.BIGPR: this.envelopeWith('Pr1(', ')'); return true;
    case TokenID.SMALLPR: this.envelopeWith('pr1(', ')'); return true;
    case TokenID.FILTER: this.envelopeWith('Fi1[α](', ')'); return true;
    case TokenID.REDUCE: this.envelopeWith('red(', ')'); return true;
    case TokenID.CARD: this.envelopeWith('card(', ')'); return true;
    case TokenID.BOOL: this.envelopeWith('bool(', ')'); return true;
    case TokenID.DEBOOL: this.envelopeWith('debool(', ')'); return true;

    case TokenID.PUNC_PL: {
      this.envelopeWith('(', ')');
      this.ref.view.dispatch({
        selection: {
          anchor: hasSelection ? selection.to: selection.from + 1,
        }
      });
      return true;
    }
    case TokenID.PUNC_SL: {
      this.envelopeWith('[', ']');
      if (hasSelection) {
        this.ref.view.dispatch({
          selection: {
            anchor: hasSelection ? selection.to: selection.from + 1,
          }
      });
      }
      return true;
    }
    case TokenID.BOOLEAN: {
      const selStart = selection.from;
      if (hasSelection && this.ref.view.state.sliceDoc(selStart, selStart + 1) === 'ℬ') {
        this.envelopeWith('ℬ', '');
      } else {
        this.envelopeWith('ℬ(', ')');
      }
      return true;
    }

    case TokenID.DECART: this.replaceWith('×'); return true;
    case TokenID.FORALL: this.replaceWith('∀'); return true;
    case TokenID.EXISTS: this.replaceWith('∃'); return true;
    case TokenID.IN: this.replaceWith('∈'); return true;
    case TokenID.NOTIN: this.replaceWith('∉'); return true;
    case TokenID.OR: this.replaceWith('∨'); return true;
    case TokenID.AND: this.replaceWith('&'); return true;
    case TokenID.SUBSET_OR_EQ: this.replaceWith('⊆'); return true;
    case TokenID.IMPLICATION: this.replaceWith('⇒'); return true;
    case TokenID.INTERSECTION: this.replaceWith('∩'); return true;
    case TokenID.UNION: this.replaceWith('∪'); return true;
    case TokenID.SET_MINUS: this.replaceWith('\\'); return true;
    case TokenID.SYMMINUS: this.replaceWith('∆'); return true;
    case TokenID.LIT_EMPTYSET: this.replaceWith('∅'); return true;
    case TokenID.LIT_INTSET: this.replaceWith('Z'); return true;
    case TokenID.SUBSET: this.replaceWith('⊂'); return true;
    case TokenID.NOTSUBSET: this.replaceWith('⊄'); return true;
    case TokenID.EQUAL: this.replaceWith('='); return true;
    case TokenID.NOTEQUAL: this.replaceWith('≠'); return true;
    case TokenID.NOT: this.replaceWith('¬'); return true;
    case TokenID.EQUIVALENT: this.replaceWith('⇔'); return true;
    case TokenID.GREATER_OR_EQ: this.replaceWith('≥'); return true;
    case TokenID.LESSER_OR_EQ: this.replaceWith('≤'); return true;
    case TokenID.PUNC_ASSIGN: this.replaceWith(':='); return true;
    case TokenID.PUNC_ITERATE: this.replaceWith(':∈'); return true;
    case TokenID.MULTIPLY: this.replaceWith('*'); return true;
    }
    return false;
  }

  processAltKey(keyCode: string, shiftPressed: boolean): boolean {
    if (shiftPressed) {
      switch (keyCode) {
      // qwert
      //  asdfg
      //   zxcvb
      case 'KeyE': return this.insertToken(TokenID.DECART);

      // `123456
      // ~!@#$%^
      case 'Backquote': return this.insertToken(TokenID.NOTEQUAL);
      case 'Digit1': return this.insertToken(TokenID.NOTIN); // !
      case 'Digit2': return this.insertToken(TokenID.NOTSUBSET); // @
      case 'Digit3': return this.insertToken(TokenID.OR); // #
      case 'Digit4': return this.insertToken(TokenID.EQUIVALENT); // $
      case 'Digit5': return this.insertToken(TokenID.SYMMINUS); // %
      case 'Digit6': return this.insertToken(TokenID.PUNC_ASSIGN); // ^
      case 'Digit7': return this.insertToken(TokenID.GREATER_OR_EQ); // &
      case 'Digit8': return this.insertToken(TokenID.LESSER_OR_EQ); // *
      case 'Digit9': return this.insertToken(TokenID.PUNC_PL); // (
      }
    } else {
      switch (keyCode) {
      // qwert
      //  asdfg
      //   zxcvb
      case 'KeyQ': return this.insertToken(TokenID.BIGPR);
      case 'KeyW': return this.insertToken(TokenID.SMALLPR);
      case 'KeyE': return this.insertToken(TokenID.BOOLEAN);
      case 'KeyR': return this.insertToken(TokenID.REDUCE);
      case 'KeyT': return this.insertToken(TokenID.NT_RECURSIVE_FULL);
      case 'KeyA': return this.insertToken(TokenID.INTERSECTION);
      case 'KeyS': return this.insertToken(TokenID.UNION);
      case 'KeyD': return this.insertToken(TokenID.NT_DECLARATIVE_EXPR);
      case 'KeyF': return this.insertToken(TokenID.FILTER);
      case 'KeyG': return this.insertToken(TokenID.NT_IMPERATIVE_EXPR);
      case 'KeyZ': return this.insertToken(TokenID.LIT_INTSET);
      case 'KeyX': return this.insertToken(TokenID.LIT_EMPTYSET);
      case 'KeyC': return this.insertToken(TokenID.CARD);
      case 'KeyV': return this.insertToken(TokenID.DEBOOL);
      case 'KeyB': return this.insertToken(TokenID.BOOL);

      // `123456
      // ~!@#$%^
      case 'Backquote': return this.insertToken(TokenID.NOT);
      case 'Digit1': return this.insertToken(TokenID.IN);
      case 'Digit2': return this.insertToken(TokenID.SUBSET_OR_EQ);
      case 'Digit3': return this.insertToken(TokenID.AND);
      case 'Digit4': return this.insertToken(TokenID.IMPLICATION);
      case 'Digit5': return this.insertToken(TokenID.SET_MINUS);
      case 'Digit6': return this.insertToken(TokenID.PUNC_ITERATE);
      case 'Digit7': return this.insertToken(TokenID.SUBSET);
      case 'Digit8': return this.insertToken(TokenID.MULTIPLY);
      case 'BracketLeft': return this.insertToken(TokenID.PUNC_SL);
      }
    }
    return false;
  }
}
