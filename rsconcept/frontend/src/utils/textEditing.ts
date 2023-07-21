// Formatted text editing helpers

import { TokenID } from './models'

export interface IManagedText {
  value: string
  selStart: number
  selEnd: number
}

// Note: Wrapper class for textareafield.
// WARNING! Manipulations on value do not support UNDO browser
// WARNING! No checks for selection out of text boundaries
export class TextWrapper implements IManagedText {
  value: string
  selStart: number
  selEnd: number
  object: HTMLTextAreaElement

  constructor(element: HTMLTextAreaElement) {
    this.object = element;
    this.value = this.object.value;
    this.selStart = this.object.selectionStart;
    this.selEnd = this.object.selectionEnd;
  }

  focus() {
    this.object.focus();
  }

  refresh() {
    this.value = this.object.value;
    this.selStart = this.object.selectionStart;
    this.selEnd = this.object.selectionEnd;
  }

  finalize() {
    this.object.value = this.value;
    this.object.selectionStart = this.selStart;
    this.object.selectionEnd = this.selEnd;
  }
 
  replaceWith(data: string) {
    this.value = this.value.substring(0, this.selStart) + data + this.value.substring(this.selEnd, this.value.length);
    this.selEnd += data.length - this.selEnd + this.selStart;
    this.selStart = this.selEnd;
  }

  envelopeWith(left: string, right: string) {
    this.value = this.value.substring(0, this.selStart) + left + 
                  this.value.substring(this.selStart, this.selEnd) + right + 
                  this.value.substring(this.selEnd, this.value.length);
    this.selEnd += left.length + right.length;
  }

  moveSel(shift: number) {
    this.selStart += shift;
    this.selEnd += shift;
  }

  setSel(start: number, end: number) {
    this.selStart = start;
    this.selEnd = end;
  }

  insertToken(tokenID: TokenID) {
    switch(tokenID) {
    case TokenID.NT_DECLARATIVE_EXPR: this.envelopeWith('D{ξ∈X1 | ', '}'); return;
    case TokenID.NT_IMPERATIVE_EXPR: this.envelopeWith('I{(σ, γ) | σ:∈X1; γ:=F1[σ]; ', '}'); return;
    case TokenID.NT_RECURSIVE_FULL: this.envelopeWith('R{ ξ:=D1 | 1=1 | ', '}'); return;
    case TokenID.BIGPR: this.envelopeWith('Pr1(', ')'); return;
    case TokenID.SMALLPR: this.envelopeWith('pr1(', ')'); return;
    case TokenID.FILTER: this.envelopeWith('Fi1[α](', ')'); return;
    case TokenID.REDUCE: this.envelopeWith('red(', ')'); return;
    case TokenID.CARD: this.envelopeWith('card(', ')'); return;
    case TokenID.BOOL: this.envelopeWith('bool(', ')'); return;
    case TokenID.DEBOOL: this.envelopeWith('debool(', ')'); return;
    case TokenID.PUNC_PL: this.envelopeWith('(', ')'); return;
    case TokenID.PUNC_SL: this.envelopeWith('[', ']'); return;

    case TokenID.BOOLEAN: {
      if (this.selEnd !== this.selStart && this.value.at(this.selStart) === 'ℬ') {
        this.envelopeWith('ℬ', '');
      } else {
        this.envelopeWith('ℬ(', ')');
      }
       return;
    }
    
    case TokenID.DECART: this.replaceWith('×'); return;
    case TokenID.FORALL: this.replaceWith('∀'); return;
    case TokenID.EXISTS: this.replaceWith('∃'); return;
    case TokenID.IN: this.replaceWith('∈'); return;
    case TokenID.NOTIN: this.replaceWith('∉'); return;
    case TokenID.OR: this.replaceWith('∨'); return;
    case TokenID.AND: this.replaceWith('&'); return;
    case TokenID.SUBSET_OR_EQ: this.replaceWith('⊆'); return;
    case TokenID.IMPLICATION: this.replaceWith('⇒'); return;
    case TokenID.INTERSECTION: this.replaceWith('∩'); return;
    case TokenID.UNION: this.replaceWith('∪'); return;
    case TokenID.MINUS: this.replaceWith('\\'); return;
    case TokenID.SYMMINUS: this.replaceWith('∆'); return;
    case TokenID.LIT_EMPTYSET: this.replaceWith('∅'); return;
    case TokenID.LIT_INTSET: this.replaceWith('Z'); return;
    case TokenID.SUBSET: this.replaceWith('⊂'); return;
    case TokenID.NOTSUBSET: this.replaceWith('⊄'); return;
    case TokenID.EQUAL: this.replaceWith('='); return;
    case TokenID.NOTEQUAL: this.replaceWith('≠'); return;
    case TokenID.NOT: this.replaceWith('¬'); return;
    case TokenID.EQUIVALENT: this.replaceWith('⇔'); return;
    case TokenID.GREATER_OR_EQ: this.replaceWith('≥'); return;
    case TokenID.LESSER_OR_EQ: this.replaceWith('≤'); return;
    case TokenID.PUNC_ASSIGN: this.replaceWith(':='); return;
    case TokenID.PUNC_ITERATE: this.replaceWith(':∈'); return;

    }
  }
};