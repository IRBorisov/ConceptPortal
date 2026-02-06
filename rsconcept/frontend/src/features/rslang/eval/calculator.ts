/**
 * Module: AST calculator - visitor-pattern evaluator for RS expressions.
 */

import { type AstNode, getNodeIndices, getNodeText } from '@/utils/parsing';

import {
  type ErrorReporter,
  RSErrorCode
} from '../error';
import { TokenID } from '../parser/token';

import {
  BOOL_INFINITY,
  compare,
  EmptySetV,
  set,
  SET_INFINITY,
  tuple,
  type Value,
  VALUE_FALSE,
  VALUE_TRUE,
  type ValueContext,
} from './value';
import {
  boolean,
  contains,
  decartian,
  isSubsetOrEq,
  projection,
  reduce,
  setDiff,
  setIntersection,
  setSymDiff,
  setUnion,
} from './value-api';

/** Maximum iterations to prevent infinite loops (recursion, quantifiers, etc.). */
export const MAX_ITERATIONS = 100_000;

/** AST context. */
export type ASTContext = Map<string, AstNode>;

/** Result of calculator evaluation. */
export interface CalculatorResult {
  success: boolean;
  value: Value | null;
  iterations: number;
}

/** Imperative iteration block data. */
interface IterationData {
  childID: number;
  domain: Value[];
  valueID: number;
}

/** AST calculator - evaluates RS expressions via visitor pattern. */
export class RSCalculator {
  private reporter?: ErrorReporter;
  private locals: LocalContext = new LocalContext();
  private context: ValueContext;
  private treeContext: ASTContext;

  private iterationCounter = 0;

  constructor(context: ValueContext, treeContext: ASTContext) {
    this.context = context;
    this.treeContext = treeContext;
  }

  evaluate(ast: AstNode, reporter?: ErrorReporter): CalculatorResult {
    if (ast.hasError) {
      return { success: false, value: null, iterations: 0 };
    }
    this.reporter = reporter;
    this.clear();
    const result = this.dispatchVisit(ast);
    if (result === null) {
      return { success: false, value: null, iterations: this.iterationCounter };
    }
    return {
      success: true,
      value: result,
      iterations: this.iterationCounter
    };
  }

  private clear(): void {
    this.locals = new LocalContext();
    this.iterationCounter = 0;
  }

  private onError(code: RSErrorCode, position: number, params?: string[]): null {
    if (this.reporter) {
      this.reporter({ code, position, params });
    }
    return null;
  }

  private tick(node: AstNode): boolean {
    if (++this.iterationCounter > MAX_ITERATIONS) {
      this.onError(RSErrorCode.valueIterationsLimit, node.from, [String(MAX_ITERATIONS)]);
      return false;
    }
    return true;
  }

  private dispatchDeclare(node: AstNode, value: Value): void {
    switch (node.typeID) {
      case TokenID.ID_LOCAL:
        return this.declareLocal(node, value);
      case TokenID.NT_TUPLE_DECL:
        return this.declareTuple(node, value as Value[]);
      case TokenID.NT_ARG_DECL:
        return this.dispatchDeclare(node.children[0], value);
    }
  }

  private declareLocal(node: AstNode, value: Value): void {
    const alias = getNodeText(node);
    this.locals.setLocal(alias, value);
  }

  private declareTuple(node: AstNode, value: Value[]): void {
    for (let child = 0; child < node.children.length; child++) {
      this.dispatchDeclare(node.children[child], value[child + 1]);
    }
  }

  private dispatchVisit(node: AstNode): Value | null {
    switch (node.typeID) {
      case TokenID.ID_GLOBAL:
        return this.visitGlobal(node);

      case TokenID.NT_FUNC_CALL:
        return this.visitFunctionCall(node);

      case TokenID.ID_LOCAL:
      case TokenID.ID_RADICAL:
        return this.visitLocal(node);

      case TokenID.LIT_INTEGER:
        return this.visitInteger(node);

      case TokenID.LIT_WHOLE_NUMBERS:
        return this.onError(RSErrorCode.valueIterateInfinity, node.from);

      case TokenID.LIT_EMPTYSET:
        return EmptySetV;

      case TokenID.PLUS:
      case TokenID.MINUS:
      case TokenID.MULTIPLY:
        return this.visitArithmetic(node);

      case TokenID.CARD:
        return this.visitCard(node);

      case TokenID.QUANTOR_UNIVERSAL:
      case TokenID.QUANTOR_EXISTS:
        return this.visitQuantifier(node);

      case TokenID.LOGIC_NOT:
        return this.visitNegation(node);

      case TokenID.LOGIC_AND:
      case TokenID.LOGIC_OR:
      case TokenID.LOGIC_IMPLICATION:
      case TokenID.LOGIC_EQUIVALENT:
        return this.visitLogicBinary(node);

      case TokenID.EQUAL:
      case TokenID.NOTEQUAL:
        return this.visitEquals(node);

      case TokenID.GREATER:
      case TokenID.LESSER:
      case TokenID.GREATER_OR_EQ:
      case TokenID.LESSER_OR_EQ:
        return this.visitIntegerPredicate(node);

      case TokenID.SET_IN:
      case TokenID.SET_NOT_IN:
      case TokenID.SUBSET:
      case TokenID.SUBSET_OR_EQ:
      case TokenID.NOT_SUBSET:
        return this.visitSetexprPredicate(node);

      case TokenID.DECART:
        return this.visitDecart(node);

      case TokenID.BOOLEAN:
        return this.visitBoolean(node);

      case TokenID.NT_TUPLE:
        return this.visitTuple(node);

      case TokenID.NT_ENUMERATION:
        return this.visitEnumeration(node);

      case TokenID.BOOL:
        return this.visitBool(node);

      case TokenID.DEBOOL:
        return this.visitDebool(node);

      case TokenID.SET_UNION:
      case TokenID.SET_INTERSECTION:
      case TokenID.SET_MINUS:
      case TokenID.SET_SYMMETRIC_MINUS:
        return this.visitSetexprBinary(node);

      case TokenID.BIGPR:
        return this.visitProjectSet(node);

      case TokenID.SMALLPR:
        return this.visitProjectTuple(node);

      case TokenID.FILTER:
        return this.visitFilter(node);

      case TokenID.REDUCE:
        return this.visitReduce(node);

      case TokenID.NT_DECLARATIVE_EXPR:
        return this.visitDeclarative(node);

      case TokenID.NT_IMPERATIVE_EXPR:
        return this.visitImperative(node);

      case TokenID.ASSIGN:
        return this.visitAssign(node);

      case TokenID.NT_RECURSIVE_FULL:
      case TokenID.NT_RECURSIVE_SHORT:
        return this.visitRecursion(node);
    }
    return null;
  }

  private visitChild(node: AstNode, index: number): Value | null {
    return this.dispatchVisit(node.children[index]);
  }

  private visitGlobal(node: AstNode): Value | null {
    const alias = getNodeText(node);
    const value = this.context.get(alias);
    if (!value) {
      return this.onError(RSErrorCode.valueGlobalMissing, node.from, [alias]);
    }
    return value;
  }

  private visitLocal(node: AstNode): Value | null {
    const alias = getNodeText(node);
    return this.locals.getLocal(alias);
  }

  private visitFunctionCall(node: AstNode): Value | null {
    const funcName = getNodeText(node.children[0]);
    const ast = this.treeContext.get(funcName);
    if (!ast) {
      return this.onError(RSErrorCode.valueGlobalMissing, node.from, [funcName]);
    }

    const args: Value[] = [];
    for (let i = 1; i < node.children.length; i++) {
      const arg = this.visitChild(node, i);
      if (arg === null) {
        return null;
      }
      args.push(arg);
    }

    this.locals.startScope();
    for (let i = 0; i < args.length; i++) {
      this.dispatchDeclare(ast.children[0].children[i], args[i]);
    }
    const result = this.visitChild(ast, 1);
    this.locals.endScope();
    return result;
  }

  private visitInteger(node: AstNode): Value | null {
    const value = node.data.dataType === 'number' ? (node.data.value as number) : Number(node.data.value);
    return Math.floor(value);
  }

  private visitArithmetic(node: AstNode): Value | null {
    const v1 = this.visitChild(node, 0);
    const v2 = this.visitChild(node, 1);
    if (v1 === null || v2 === null) {
      return null;
    }
    const a = (v1 as number);
    const b = (v2 as number);
    switch (node.typeID) {
      case TokenID.PLUS: return a + b;
      case TokenID.MINUS: return a - b;
      case TokenID.MULTIPLY: return a * b;
    }
    return null;
  }

  private visitCard(node: AstNode): Value | null {
    const base = this.visitChild(node, 0);
    if (!base || !Array.isArray(base)) {
      return null;
    }
    return base.length;
  }

  private visitQuantifier(node: AstNode): Value | null {
    const domain = this.visitChild(node, 1) as Value[];
    if (domain === null) {
      return null;
    }
    const isUniversal = node.typeID === TokenID.QUANTOR_UNIVERSAL;
    if (domain.length === 0) {
      return isUniversal ? VALUE_TRUE : VALUE_FALSE;
    }

    const varNodes = node.children[0].typeID === TokenID.NT_ENUM_DECL ? node.children[0].children : [node.children[0]];
    const count = domain.length;
    const iterators: number[] = [];
    for (const declaration of varNodes) {
      iterators.push(0);
      this.dispatchDeclare(declaration, domain[0]);
    }
    let finishIteration = false;
    while (!finishIteration) {
      const iterationValue = this.visitChild(node, 2);
      if (iterationValue === null) {
        return null;
      }
      if ((iterationValue === VALUE_TRUE) !== isUniversal) {
        return !isUniversal ? VALUE_TRUE : VALUE_FALSE;
      }
      let incrementIndex = iterators.length - 1;
      while (true) {
        if (iterators[incrementIndex] < count - 1) {
          iterators[incrementIndex]++;
          if (!this.tick(node)) {
            return null;
          }
          this.dispatchDeclare(varNodes[incrementIndex], domain[iterators[incrementIndex]]);
          incrementIndex = iterators.length - 1;
          break;
        } else if (incrementIndex === 0) {
          finishIteration = true;
          break;
        } else {
          iterators[incrementIndex] = 0;
          this.dispatchDeclare(varNodes[incrementIndex], domain[0]);
          incrementIndex--;
        }
      }
    }
    return isUniversal ? VALUE_TRUE : VALUE_FALSE;
  }

  private visitNegation(node: AstNode): Value | null {
    const value = this.visitChild(node, 0);
    if (value === null) {
      return null;
    }
    return (value as number) === VALUE_TRUE ? VALUE_FALSE : VALUE_TRUE;
  }

  private tryEvaluateFromFirstArg(op: number, first: boolean): Value | null {
    if ((op === TokenID.LOGIC_AND && !first) || (op === TokenID.LOGIC_OR && first)) {
      return first ? VALUE_TRUE : VALUE_FALSE;
    }
    if (op === TokenID.LOGIC_IMPLICATION && !first) {
      return VALUE_TRUE;
    }
    return null;
  }

  private visitLogicBinary(node: AstNode): Value | null {
    const v1 = this.visitChild(node, 0);
    if (v1 === null) {
      return null;
    }
    const b1 = v1 === VALUE_TRUE;
    const attempt = this.tryEvaluateFromFirstArg(node.typeID, b1);
    if (attempt !== null) {
      return attempt;
    }

    const v2 = this.visitChild(node, 1);
    if (v2 === null) {
      return null;
    }
    const b2 = v2 === VALUE_TRUE;
    let result: boolean;
    switch (node.typeID) {
      case TokenID.LOGIC_AND: result = b1 && b2; break;
      case TokenID.LOGIC_OR: result = b1 || b2; break;
      case TokenID.LOGIC_IMPLICATION: result = !b1 || b2; break;
      case TokenID.LOGIC_EQUIVALENT: result = b1 === b2; break;
      default: return null;
    }
    return result ? VALUE_TRUE : VALUE_FALSE;
  }

  private visitEquals(node: AstNode): Value | null {
    const v1 = this.visitChild(node, 0);
    const v2 = this.visitChild(node, 1);
    if (v1 === null || v2 === null) {
      return null;
    }
    const areEqual = compare(v1, v2) === 0;
    return areEqual === (node.typeID !== TokenID.NOTEQUAL) ? VALUE_TRUE : VALUE_FALSE;
  }

  private visitIntegerPredicate(node: AstNode): Value | null {
    const v1 = this.visitChild(node, 0);
    const v2 = this.visitChild(node, 1);
    if (v1 === null || v2 === null) {
      return null;
    }
    const a = v1 as number;
    const b = v2 as number;
    let result: boolean;
    switch (node.typeID) {
      case TokenID.GREATER: result = a > b; break;
      case TokenID.LESSER: result = a < b; break;
      case TokenID.GREATER_OR_EQ: result = a >= b; break;
      case TokenID.LESSER_OR_EQ: result = a <= b; break;
      default: return null;
    }
    return result ? VALUE_TRUE : VALUE_FALSE;
  }

  private visitSetexprPredicate(node: AstNode): Value | null {
    const v1 = this.visitChild(node, 0);
    const v2 = this.visitChild(node, 1);
    if (v1 === null || v2 === null) {
      return null;
    }
    let result: boolean;
    switch (node.typeID) {
      case TokenID.SET_IN:
        result = contains(v2 as Value[], v1);
        break;
      case TokenID.SET_NOT_IN:
        result = !contains(v2 as Value[], v1);
        break;
      case TokenID.SUBSET:
        result = compare(v1, v2) !== 0 && isSubsetOrEq(v1 as Value[], v2 as Value[]);
        break;
      case TokenID.NOT_SUBSET:
        result = compare(v1, v2) === 0 || !isSubsetOrEq(v1 as Value[], v2 as Value[]);
        break;
      case TokenID.SUBSET_OR_EQ:
        result = isSubsetOrEq(v1 as Value[], v2 as Value[]);
        break;
      default:
        return null;
    }
    return result ? VALUE_TRUE : VALUE_FALSE;
  }

  private visitDecart(node: AstNode): Value | null {
    const args: Value[] = [];
    for (let i = 0; i < node.children.length; i++) {
      const component = this.visitChild(node, i) as Value[];
      if (component === null) {
        return null;
      }
      if (component.length === 0) {
        return EmptySetV;
      }
      args.push(component);
    }
    const result = decartian(args as Value[][]);
    if (result === null) {
      return null;
    }
    if (result.length >= SET_INFINITY) {
      this.onError(RSErrorCode.valueTypedOverflow, node.from, [String(SET_INFINITY)]);
      return null;
    }
    return result;
  }

  private visitBoolean(node: AstNode): Value | null {
    const base = this.visitChild(node, 0) as Value[];
    if (base === null) {
      return null;
    }
    const result = boolean(base);
    if (result === null) {
      this.onError(RSErrorCode.valueBooleanLimit, node.from, [String(BOOL_INFINITY)]);
      return null;
    }
    return result;
  }

  private visitTuple(node: AstNode): Value | null {
    const args: Value[] = [];
    for (let i = 0; i < node.children.length; i++) {
      const component = this.visitChild(node, i);
      if (component === null) {
        return null;
      }
      args.push(component);
    }
    return tuple(args);
  }

  private visitEnumeration(node: AstNode): Value | null {
    const args: Value[] = [];
    for (let i = 0; i < node.children.length; i++) {
      const element = this.visitChild(node, i);
      if (element === null) {
        return null;
      }
      args.push(element);
    }
    return set(args);
  }

  private visitBool(node: AstNode): Value | null {
    const element = this.visitChild(node, 0);
    if (element === null) {
      return null;
    }
    return [element];
  }

  private visitDebool(node: AstNode): Value | null {
    const target = this.visitChild(node, 0) as Value[];
    if (target === null) {
      return null;
    }
    if (target.length !== 1) {
      return this.onError(RSErrorCode.valueInvalidDebool, node.from);
    }
    return target[0];
  }

  private visitSetexprBinary(node: AstNode): Value | null {
    const v1 = this.visitChild(node, 0);
    const v2 = this.visitChild(node, 1);
    if (v1 === null || v2 === null) {
      return null;
    }
    switch (node.typeID) {
      case TokenID.SET_UNION:
        return setUnion(v1 as Value[], v2 as Value[]);
      case TokenID.SET_INTERSECTION:
        return setIntersection(v1 as Value[], v2 as Value[]);
      case TokenID.SET_MINUS:
        return setDiff(v1 as Value[], v2 as Value[]);
      case TokenID.SET_SYMMETRIC_MINUS:
        return setSymDiff(v1 as Value[], v2 as Value[]);
    }
    return null;
  }

  private visitProjectSet(node: AstNode): Value | null {
    const target = this.visitChild(node, 0);
    if (target === null) {
      return null;
    }
    const indices = getNodeIndices(node);
    return projection(target as Value[][], indices);
  }

  private visitProjectTuple(node: AstNode): Value | null {
    const target = this.visitChild(node, 0) as Value[];
    if (target === null) {
      return null;
    }
    const indices = getNodeIndices(node);
    const components = indices.map(i => target[i]);
    return components.length === 1 ? components[0] : tuple(components);
  }

  private visitFilter(node: AstNode): Value | null {
    const lastIdx = node.children.length - 1;
    const argVal = this.visitChild(node, lastIdx) as Value[][];
    if (argVal === null) {
      return null;
    }
    if (argVal.length === 0) {
      return EmptySetV;
    }

    const indices = getNodeIndices(node);
    const tupleParam = indices.length === lastIdx;
    if (tupleParam) {
      const params: Value[] = [];
      for (let i = 0; i < lastIdx; i++) {
        const param = this.visitChild(node, i) as Value[];
        if (param === null) {
          return null;
        }
        if (param.length === 0) {
          return EmptySetV;
        }
        params.push(param);
      }
      const result: Value[] = [];
      for (const element of argVal) {
        let valid = true;
        for (let j = 0; j < indices.length; j++) {
          const comp = (element)[indices[j]];
          const paramSet = params[j] as Value[];
          if (!contains(paramSet, comp)) {
            valid = false;
            break;
          }
        }
        if (valid) {
          result.push(element);
        }
      }
      return result;
    } else {
      const paramVal = this.visitChild(node, 0) as Value[];
      if (paramVal === null) {
        return null;
      }
      if (paramVal.length === 0) {
        return EmptySetV;
      }

      const result: Value[] = [];
      for (const element of argVal) {
        const comps = indices.map(i => element[i]);
        const testElement = comps.length === 1 ? comps[0] : tuple(comps);
        if (contains(paramVal, testElement)) result.push(element);
      }
      return result;
    }
  }

  private visitReduce(node: AstNode): Value | null {
    const target = this.visitChild(node, 0);
    if (target === null) {
      return null;
    }
    return reduce(target as Value[][]);
  }

  private visitDeclarative(node: AstNode): Value | null {
    const domain = this.visitChild(node, 1);
    if (!domain) {
      return null;
    }

    const elements = [];
    for (const element of domain as Value[]) {
      if (!this.tick(node)) {
        return null;
      }
      this.dispatchDeclare(node.children[0], element);
      const value = this.visitChild(node, 2);
      if (value === null) {
        return null;
      }
      if (value === VALUE_TRUE) {
        elements.push(element);
      }
    }
    return elements.length === 0 ? EmptySetV : elements;
  }

  private visitImperative(node: AstNode): Value | null {
    const result: Value[] = [];
    const iterations: IterationData[] = [];
    let current = 1;
    while (true) {
      if (current >= node.children.length) {
        const element = this.visitChild(node, 0);
        if (element === null) {
          return null;
        }
        result.push(element);
        while (iterations.length > 0) {
          const iteration = iterations[iterations.length - 1];
          if (iteration.valueID === iteration.domain.length - 1) {
            iterations.pop();
          } else {
            iteration.valueID++;
            const newValue = iteration.domain[iteration.valueID];
            if (!this.tick(node.children[iteration.childID])) {
              return null;
            }
            this.dispatchDeclare(node.children[iteration.childID].children[0], newValue);
            current = iteration.childID + 1;
            break;
          }
        }
        if (iterations.length === 0) {
          break;
        } else {
          continue;
        }
      }

      const child = node.children[current];
      if (child.typeID === TokenID.ITERATE) {
        const domain = this.visitChild(child, 1) as Value[];
        if (domain === null) {
          return null;
        }
        if (!this.tick(child)) {
          return null;
        }
        iterations.push({ childID: current, domain: domain, valueID: 0 });
        this.dispatchDeclare(child.children[0], domain[0]);
        current++;
        continue;
      }
      const value = this.dispatchVisit(child);
      if (value === null) {
        return null;
      }
      if (value === VALUE_FALSE) {
        while (iterations.length > 0) {
          const iteration = iterations[iterations.length - 1];
          if (iteration.valueID === iteration.domain.length - 1) {
            iterations.pop();
          } else {
            iteration.valueID++;
            const newValue = iteration.domain[iteration.valueID];
            if (!this.tick(node.children[iteration.childID])) {
              return null;
            }
            this.dispatchDeclare(node.children[iteration.childID].children[0], newValue);
            current = iteration.childID;
            break;
          }
        }
        if (iterations.length === 0) {
          break;
        }
      }
      current++;
    }
    return set(result);
  }

  private visitAssign(node: AstNode): Value | null {
    const value = this.visitChild(node, 1);
    if (value === null) {
      return null;
    }
    this.dispatchDeclare(node.children[0], value);
    return VALUE_TRUE;
  }

  private visitRecursion(node: AstNode): Value | null {
    const initialValue = this.visitChild(node, 1);
    if (initialValue === null) {
      return null;
    }
    const bodyIndex = node.typeID === TokenID.NT_RECURSIVE_FULL ? 3 : 2;
    let current: Value = initialValue;
    while (true) {
      if (!this.tick(node)) {
        return null;
      }

      this.dispatchDeclare(node.children[0], current);
      if (node.typeID === TokenID.NT_RECURSIVE_FULL) {
        const pred = this.visitChild(node, 2);
        if (pred === null) {
          return null;
        }
        if (pred !== VALUE_TRUE) {
          break;
        }
      }

      const next = this.visitChild(node, bodyIndex);
      if (!next) {
        return null;
      }
      if (compare(current, next) === 0) {
        break;
      }
      current = next;
    }

    return current;
  }
}

/** Local variables context. */
class LocalContext {
  private data: ValueContext = new Map<string, Value>();
  private callStack: ValueContext[] = [];

  startScope(): void {
    this.callStack.push(this.data);
  }

  endScope(): void {
    this.data = this.callStack.pop()!;
  }

  setLocal(alias: string, value: Value): void {
    this.data.set(alias, value);
  }

  getLocal(alias: string): Value {
    const local = this.data.get(alias);
    if (local === undefined) {
      throw new Error(`Local variable "${alias}" not found`);
    }
    return local;
  }
}