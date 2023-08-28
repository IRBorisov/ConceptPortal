// Formatted text editing helpers

import { ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { TokenID } from '../../utils/enums';

export function getSymbolSubstitute(input: string): string | undefined {
  switch (input) {
  case '`': return '∀';
  case '~': return '∃';

  // qwerty = μωερτπ
  //  asdfgh = ασδφγλ
  //   zxcvbn = ζξψθβη
  case 'q': return 'μ';
  case 'w': return 'ω';
  case 'e': return 'ε';
  case 'r': return 'ρ';
  case 't': return 'τ';
  case 'y': return 'π';

  case 'a': return 'α';
  case 's': return 'σ';
  case 'd': return 'δ';
  case 'f': return 'φ';
  case 'g': return 'γ';
  case 'h': return 'λ';

  case 'z': return 'ζ';
  case 'x': return 'ξ';
  case 'c': return 'ψ';
  case 'v': return 'θ';
  case 'b': return 'β';
  case 'n': return 'η';
  }
  return undefined;
}

// Note: Wrapper class for textareafield.
// WARNING! Manipulations on value do not support UNDO browser
// WARNING! No checks for selection out of text boundaries
export class TextWrapper {
  ref: Required<ReactCodeMirrorRef>

  constructor(object: Required<ReactCodeMirrorRef>) {
    this.ref = object;
  }

  replaceWith(data: string) {
    this.ref.view.dispatch(this.ref.view.state.replaceSelection(data));
  }

  envelopeWith(left: string, right: string) {
    const hasSelection = this.ref.view.state.selection.main.from !== this.ref.view.state.selection.main.to
    const newSelection = hasSelection ? {
      anchor: this.ref.view.state.selection.main.from,
      head: this.ref.view.state.selection.main.to + left.length + right.length
    } : {
      anchor: this.ref.view.state.selection.main.to + left.length + right.length - 1,
    }
    this.ref.view.dispatch({
      changes: [
        {from: this.ref.view.state.selection.main.from, insert: left}, 
        {from: this.ref.view.state.selection.main.to, insert: right}
      ],
      selection: newSelection
    });
  }

  insertChar(key: string) {
    this.replaceWith(key);
  }

  insertToken(tokenID: TokenID): boolean {
    const hasSelection = this.ref.view.state.selection.main.from !== this.ref.view.state.selection.main.to
    switch (tokenID) {
    case TokenID.NT_DECLARATIVE_EXPR: {
      if (hasSelection) {
        this.envelopeWith('D{ξ∈X1 | ', '}');
      } else {
        this.envelopeWith('D{ξ∈X1 | P1[ξ]', '}');
      }
      this.ref.view.dispatch({
        selection: {
          anchor: this.ref.view.state.selection.main.from + 2,
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
          anchor: hasSelection ? this.ref.view.state.selection.main.to: this.ref.view.state.selection.main.from + 1,
        }
      });
      return true;
    }
    case TokenID.PUNC_SL: {
      this.envelopeWith('[', ']');
      if (hasSelection) {
        this.ref.view.dispatch({
          selection: {
            anchor: hasSelection ? this.ref.view.state.selection.main.to: this.ref.view.state.selection.main.from + 1,
          }
      });
      }
      return true;
    }
    case TokenID.BOOLEAN: {
      const selStart = this.ref.view.state.selection.main.from;
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

  processAltKey(key: string): boolean {
    switch (key) {
    // qwert
    //  asdfg
    //   zxcvb
    case 'q': return this.insertToken(TokenID.BIGPR);
    case 'w': return this.insertToken(TokenID.SMALLPR);
    case 'e': return this.insertToken(TokenID.BOOLEAN);
    case 'E': return this.insertToken(TokenID.DECART);
    case 'r': return this.insertToken(TokenID.REDUCE);
    case 't': return this.insertToken(TokenID.NT_RECURSIVE_FULL);
    case 'a': return this.insertToken(TokenID.INTERSECTION);
    case 's': return this.insertToken(TokenID.UNION);
    case 'd': return this.insertToken(TokenID.NT_DECLARATIVE_EXPR);
    case 'f': return this.insertToken(TokenID.FILTER);
    case 'g': return this.insertToken(TokenID.NT_IMPERATIVE_EXPR);
    case 'z': return this.insertToken(TokenID.LIT_INTSET);
    case 'x': return this.insertToken(TokenID.LIT_EMPTYSET);
    case 'c': return this.insertToken(TokenID.CARD);
    case 'v': return this.insertToken(TokenID.DEBOOL);
    case 'b': return this.insertToken(TokenID.BOOL);

    // `123456
    // ~!@#$%^
    case '`': return this.insertToken(TokenID.NOT);
    case '~': return this.insertToken(TokenID.NOTEQUAL);
    case '1': return this.insertToken(TokenID.IN);
    case '!': return this.insertToken(TokenID.NOTIN); // Alt + 1
    case '2': return this.insertToken(TokenID.SUBSET_OR_EQ);
    case '@': return this.insertToken(TokenID.NOTSUBSET); // Alt + 2
    case '3': return this.insertToken(TokenID.AND);
    case '#': return this.insertToken(TokenID.OR); // Alt + 3
    case '4': return this.insertToken(TokenID.IMPLICATION);
    case '$': return this.insertToken(TokenID.EQUIVALENT); // Alt + 4
    case '5': return this.insertToken(TokenID.SET_MINUS);
    case '%': return this.insertToken(TokenID.SYMMINUS); // Alt + 5
    case '6': return this.insertToken(TokenID.PUNC_ITERATE);
    case '^': return this.insertToken(TokenID.PUNC_ASSIGN); // Alt + 6
    case '7': return this.insertToken(TokenID.SUBSET);
    case '&': return this.insertToken(TokenID.GREATER_OR_EQ); // Alt + 7
    case '8': return this.insertToken(TokenID.MULTIPLY);
    case '*': return this.insertToken(TokenID.LESSER_OR_EQ); // Alt + 8
    case '(': return this.insertToken(TokenID.PUNC_PL); // Alt + 9
    case '[': return this.insertToken(TokenID.PUNC_SL);
    }
    return false;
  }
}
