import {
  bool,
  type ExpressionType,
  IntegerT,
  isTypification,
  LogicT,
  tuple,
  TypeID,
  type Typification
} from './typification';

export interface TypificationParseResult {
  type: ExpressionType | null;
  error: string | null;
}

export function parseTypeText(input: string): TypificationParseResult {
  const normalized = input.trim().replaceAll('->', '→');
  if (normalized.length === 0) {
    return { type: null, error: null };
  }
  const parser = new TypificationParser(normalized);
  return parser.parse();
}

/** ASCII substitutions while editing typification text */
export function applyAsciiTypeSubstitutions(raw: string): string {
  return raw.replaceAll('->', '→').replaceAll('*', '×').replaceAll('B', 'ℬ');
}

class TypificationParser {
  private index = 0;
  private input: string;

  constructor(input: string) {
    this.index = 0;
    this.input = input;
  }

  parse(): TypificationParseResult {
    try {
      const result = this.parseExpressionType();
      this.skipSpaces();
      if (!this.eof()) {
        throw new Error('Unexpected trailing symbols');
      }
      return { type: result, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { type: null, error: message };
    }
  }

  private parseExpressionType(): ExpressionType {
    this.skipSpaces();
    if (this.peek() === '[') {
      return this.parseCallableType();
    } else {
      return this.parseTypification();
    }
  }

  private parseCallableType(): ExpressionType {
    this.expect('[');
    const args: Typification[] = [];
    this.skipSpaces();
    if (this.peek() !== ']') {
      while (true) {
        args.push(this.parseTypification());
        this.skipSpaces();
        if (this.peek() === ',') {
          this.next();
          this.skipSpaces();
          if (this.peek() === ']') {
            throw new Error('Empty argument in callable typification');
          }
          continue;
        }
        break;
      }
    }
    this.expect(']');
    this.skipSpaces();
    this.expect('→');
    const result = this.parseCallableResult();
    if (result.typeID === TypeID.logic) {
      return {
        typeID: TypeID.predicate,
        result: LogicT,
        args: args.map((arg, index) => ({ alias: `a${index + 1}`, type: arg }))
      };
    }
    if (!isTypification(result)) {
      throw new Error('Invalid callable result type');
    }
    return {
      typeID: TypeID.function,
      result: result as Typification,
      args: args.map((arg, index) => ({ alias: `a${index + 1}`, type: arg }))
    };
  }

  private parseCallableResult(): ExpressionType {
    this.skipSpaces();
    const lookahead = this.readToken();
    this.index -= lookahead.length;
    if (lookahead === 'Logic') {
      this.index += lookahead.length;
      return LogicT;
    }
    return this.parseTypification();
  }

  private parseTypification(): Typification {
    this.skipSpaces();
    if (this.match('ℬ')) {
      this.skipSpaces();
      if (this.peek() === '(') {
        this.next();
        const base = this.parseTypification();
        this.expect(')');
        return bool(base);
      }
      const base = this.parseTypificationAtom();
      return bool(base);
    }
    const first = this.parseTypificationAtom();
    const factors: Typification[] = [first];
    while (true) {
      this.skipSpaces();
      if (!this.match('×')) {
        break;
      }
      factors.push(this.parseTypificationAtom());
    }
    if (factors.length === 1) {
      return first;
    }
    return tuple(factors);
  }

  private parseTypificationAtom(): Typification {
    this.skipSpaces();
    if (this.peek() === '(') {
      this.next();
      const wrapped = this.parseTypification();
      this.expect(')');
      return wrapped;
    }
    const token = this.readToken();
    if (token === 'Z') {
      return IntegerT;
    }
    if (token === 'R0') {
      return { typeID: TypeID.anyTypification };
    }
    if (!/^[A-Z]\d+$/.test(token)) {
      throw new Error(`Unknown typification token "${token}"`);
    }
    return { typeID: TypeID.basic, baseID: token };
  }

  private readToken(): string {
    this.skipSpaces();
    const start = this.index;
    while (!this.eof()) {
      const char = this.peek();
      if (!char || /[\s,()[\]→×]/.test(char)) {
        break;
      }
      this.next();
    }
    if (start === this.index) {
      throw new Error('Expected typification token');
    }
    return this.input.slice(start, this.index);
  }

  private skipSpaces(): void {
    while (!this.eof() && /\s/.test(this.peek()!)) {
      this.index += 1;
    }
  }

  private expect(symbol: string): void {
    this.skipSpaces();
    if (!this.match(symbol)) {
      throw new Error(`Expected "${symbol}"`);
    }
  }

  private match(symbol: string): boolean {
    if (this.input.startsWith(symbol, this.index)) {
      this.index += symbol.length;
      return true;
    }
    return false;
  }

  private peek(): string | undefined {
    return this.input[this.index];
  }

  private next(): string | undefined {
    const value = this.input[this.index];
    this.index += 1;
    return value;
  }

  private eof(): boolean {
    return this.index >= this.input.length;
  }
}
