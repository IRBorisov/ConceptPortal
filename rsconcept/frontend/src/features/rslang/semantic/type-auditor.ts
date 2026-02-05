/**
 * Module: Type auditor for AST type checking.
 */

import { type AstNode, getNodeIndices, getNodeText } from '@/utils/parsing';

import { type ErrorReporter, RSErrorCode } from '../error';
import { labelRSLangNode, labelToken, labelType } from '../labels';
import { TokenID } from '../parser/token';

import {
  type Argument, bool, component, debool, type EchelonTuple, EmptySetT,
  type ExpressionType, IntegerT, isRadical, isTypification, LogicT,
  type Parametrized, tuple, type TypeContext, TypeID, type Typification
} from './typification';
import {
  checkCompatibility, checkEquality,
  compareTemplated, hasGenerics, mergeTypifications, substituteBase
} from './typification-api';

/** Type auditor for AST type checking. */
export class TypeAuditor {
  private static readonly TYPE_DEDUCTION_DEPTH = 5;

  private context: TypeContext;
  private reporter?: ErrorReporter;
  private locals: LocalContext;

  constructor(context: TypeContext) {
    this.context = context;
    this.locals = new LocalContext(this.onError.bind(this));
  }

  run(ast: AstNode, reporter?: ErrorReporter): ExpressionType | null {
    if (ast.hasError) {
      return null;
    }
    this.reporter = reporter;
    this.clear();
    return this.dispatchVisit(ast);
  }

  private clear(): void {
    this.locals = new LocalContext(this.onError.bind(this));
  }

  private dispatchDeclare(node: AstNode, domain: Typification): boolean {
    switch (node.typeID) {
      case TokenID.ID_LOCAL:
        return this.declareLocal(node, domain);
      case TokenID.NT_TUPLE_DECL:
        return this.declareTuple(node, domain);
      case TokenID.NT_ENUM_DECL:
        return this.declareEnumeration(node, domain);
    }
    return false;
  }

  private declareLocal(node: AstNode, domain: Typification): boolean {
    const localName = getNodeText(node);
    return this.locals.pushLocal(localName, domain, node.from);
  }

  private declareTuple(node: AstNode, domain: Typification): boolean {
    if (domain.typeID !== TypeID.tuple || domain.factors.length !== node.children.length) {
      this.onError(RSErrorCode.invalidCortegeDeclare, node.children[0].from);
      return false;
    }
    for (let child = 0; child < node.children.length; child++) {
      if (!this.visitChildDeclaration(node, child, component(domain, child + 1))) {
        return false;
      }
    }
    return true;
  }

  private declareEnumeration(node: AstNode, domain: Typification): boolean {
    for (const child of node.children) {
      if (!this.dispatchDeclare(child, domain)) {
        return false;
      }
    }
    return true;
  }

  private dispatchVisit(node: AstNode): ExpressionType | null {
    switch (node.typeID) {
      case TokenID.ID_GLOBAL:
      case TokenID.ID_FUNCTION:
      case TokenID.ID_PREDICATE:
        return this.visitGlobal(node);

      case TokenID.ID_LOCAL: return this.visitLocal(node);
      case TokenID.ID_RADICAL: return this.visitRadical(node);

      case TokenID.LIT_INTEGER: return IntegerT;
      case TokenID.LIT_WHOLE_NUMBERS: return bool(IntegerT);
      case TokenID.LIT_EMPTYSET: return this.visitEmptySet(node);

      case TokenID.NT_ARGUMENTS: return this.visitArgumentsEnum(node);
      case TokenID.NT_ARG_DECL: return this.visitArgument(node);

      case TokenID.PLUS:
      case TokenID.MINUS:
      case TokenID.MULTIPLY:
        return this.visitArithmetic(node);

      case TokenID.QUANTOR_UNIVERSAL:
      case TokenID.QUANTOR_EXISTS:
        return this.visitQuantifier(node);

      case TokenID.LOGIC_NOT: return this.visitNegation(node);

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

      case TokenID.DECART: return this.visitDecart(node);
      case TokenID.BOOLEAN: return this.visitBoolean(node);

      case TokenID.NT_TUPLE: return this.visitTuple(node);
      case TokenID.NT_ENUMERATION: return this.visitEnumeration(node);

      case TokenID.BIGPR: return this.visitProjectSet(node);
      case TokenID.SMALLPR: return this.visitProjectTuple(node);
      case TokenID.FILTER: return this.visitFilter(node);

      case TokenID.CARD: return this.visitCard(node);
      case TokenID.REDUCE: return this.visitReduce(node);
      case TokenID.BOOL: return this.visitBool(node);
      case TokenID.DEBOOL: return this.visitDebool(node);

      case TokenID.SET_UNION:
      case TokenID.SET_INTERSECTION:
      case TokenID.SET_MINUS:
      case TokenID.SET_SYMMETRIC_MINUS:
        return this.visitSetexprBinary(node);

      case TokenID.NT_FUNC_DEFINITION:
        return this.visitFunctionDefinition(node);

      case TokenID.NT_FUNC_CALL:
        return this.visitFunctionCall(node);

      case TokenID.ITERATE: return this.visitIterate(node);
      case TokenID.ASSIGN: return this.visitAssign(node);

      case TokenID.NT_DECLARATIVE_EXPR: return this.visitDeclarative(node);
      case TokenID.NT_IMPERATIVE_EXPR: return this.visitImperative(node);

      case TokenID.NT_RECURSIVE_FULL:
      case TokenID.NT_RECURSIVE_SHORT:
        return this.visitRecursion(node);
    }
    return null;
  }

  private onError(code: RSErrorCode, position: number, params?: string[]): null {
    if (this.reporter) {
      this.reporter({ code, position, params });
    }
    return null;
  }

  private visitChild(node: AstNode, index: number): ExpressionType | null {
    if (index >= node.children.length) {
      return null;
    }
    return this.dispatchVisit(node.children[index]);
  }

  private visitChildDeclaration(node: AstNode, index: number, domain: Typification): boolean {
    if (index >= node.children.length) {
      return false;
    }
    if (!this.dispatchDeclare(node.children[index], domain)) {
      return false;
    }
    return true;
  }

  private visitAllAndReturn(node: AstNode, type: ExpressionType | null): ExpressionType | null {
    for (const child of node.children) {
      if (!this.dispatchVisit(child)) {
        return null;
      }
    }
    return type;
  }

  private childTypification(node: AstNode, index: number): Typification | null {
    const result = this.visitChild(node, index);
    if (result === null || !isTypification(result)) {
      return null;
    } else {
      return result as Typification;
    }
  }

  private childTypeDebool(node: AstNode, index: number, errorCode: RSErrorCode): Typification | null {
    const result = this.childTypification(node, index);
    if (result === null) {
      return null;
    }
    if (result.typeID === TypeID.anyTypification) {
      return result;
    }
    if (result.typeID !== TypeID.collection) {
      this.onError(errorCode, node.children[index].from, [labelType(result)]);
      return null;
    }
    return debool(result);
  }

  private visitLocal(node: AstNode): ExpressionType | null {
    const localName = getNodeText(node);
    return this.locals.getLocalType(localName, node.from);
  }

  private visitGlobal(node: AstNode): ExpressionType | null {
    const alias = getNodeText(node);
    const type = this.context.get(alias);
    if (!type) {
      return this.onError(RSErrorCode.globalNotTyped, node.from, [alias]);
    }
    return type;
  }

  private visitFunctionDefinition(node: AstNode): ExpressionType | null {
    this.locals.startScope();
    if (!this.visitChild(node, 0)) {
      return null;
    }

    const args: Argument[] = [];
    for (const local of this.locals.data) {
      if (local.level === 1) {
        args.push({ alias: local.alias, type: local.type });
      }
    }

    const result = this.visitChild(node, 1);
    if (result === null || result.typeID === TypeID.function || result.typeID === TypeID.predicate) {
      return null;
    }
    this.locals.endScope(node.from);
    if (result.typeID === TypeID.logic) {
      return {
        typeID: TypeID.predicate,
        result: result,
        args: args
      };
    } else {
      return {
        typeID: TypeID.function,
        result: result,
        args: args
      };
    }
  }

  private visitFunctionCall(node: AstNode): ExpressionType | null {
    const funcName = getNodeText(node.children[0]);
    const funcType = this.context.get(funcName);
    if (funcType?.typeID !== TypeID.function && funcType?.typeID !== TypeID.predicate) {
      return this.onError(RSErrorCode.globalNotTyped, node.from, [funcName]);
    }
    const substitutes = this.checkFuncArguments(node, funcName, funcType);
    if (substitutes === null) {
      return null;
    }
    if (funcType.result.typeID === TypeID.logic) {
      return funcType.result;
    } else {
      const result = mangleRadicals(funcName, funcType.result);
      if (substitutes.size > 0) {
        substituteBase(result, substitutes);
      }
      return result;
    }
  }

  private visitRadical(node: AstNode): ExpressionType | null {
    const alias = getNodeText(node);
    if (!this.isInsideFuncArgument(node)) {
      return this.onError(RSErrorCode.radicalUsage, node.from, [alias]);
    }
    return bool({ typeID: TypeID.basic, baseID: alias });
  }

  private visitEmptySet(node: AstNode): ExpressionType | null {
    const invalidParents: TokenID[] = [
      TokenID.CARD,
      TokenID.DEBOOL,
      TokenID.SET_UNION,
      TokenID.SET_INTERSECTION,
      TokenID.SET_MINUS,
      TokenID.SET_SYMMETRIC_MINUS,
      TokenID.REDUCE,
      TokenID.BIGPR,
      TokenID.SMALLPR
    ];
    if (invalidParents.includes(node.parent?.typeID as TokenID)) {
      return this.onError(RSErrorCode.invalidEmptySetUsage, node.from);
    }
    return EmptySetT;
  }

  private visitArgument(node: AstNode): ExpressionType | null {
    const domain = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    if (domain === null) {
      return null;
    }
    if (!this.visitChildDeclaration(node, 0, domain)) {
      return null;
    }
    return domain;
  }

  private visitCard(node: AstNode): ExpressionType | null {
    if (!this.childTypeDebool(node, 0, RSErrorCode.invalidCard)) {
      return null;
    }
    return IntegerT;
  }

  private visitArithmetic(node: AstNode): ExpressionType | null {
    const type1 = this.childTypification(node, 0);
    if (type1 === null) {
      return null;
    }
    if (!('isArithmetic' in type1 && type1.isArithmetic)) {
      return this.onError(RSErrorCode.arithmeticNotSupported, node.children[0].from, [labelType(type1)]);
    }

    const type2 = this.childTypification(node, 1);
    if (type2 === null) {
      return null;
    }
    if (!('isArithmetic' in type2 && type2.isArithmetic)) {
      return this.onError(RSErrorCode.arithmeticNotSupported, node.children[1].from, [labelType(type2)]);
    }

    const result = mergeTypifications(type1, type2);
    if (result === null) {
      return this.onError(
        RSErrorCode.typesNotCompatible,
        node.children[1].from,
        [labelType(type1), labelType(type2)]
      );
    }
    return result;
  }

  private visitIntegerPredicate(node: AstNode): ExpressionType | null {
    const type1 = this.childTypification(node, 0);
    if (type1 === null) {
      return null;
    }
    if (!('isOrdered' in type1 && type1.isOrdered)) {
      return this.onError(
        RSErrorCode.orderingNotSupported,
        node.children[0].from,
        [labelType(type1)]
      );
    }

    const type2 = this.childTypification(node, 1);
    if (type2 === null) {
      return null;
    }
    if (!('isOrdered' in type2 && type2.isOrdered)) {
      return this.onError(
        RSErrorCode.orderingNotSupported,
        node.children[1].from,
        [labelType(type2)]
      );
    }

    if (!checkCompatibility(type1, type2)) {
      return this.onError(
        RSErrorCode.typesNotCompatible,
        node.children[1].from,
        [labelType(type1), labelType(type2)]
      );
    }
    return LogicT;
  }

  private visitQuantifier(node: AstNode): ExpressionType | null {
    this.locals.startScope();

    const domain = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    if (domain === null) {
      return null;
    } else if (!this.visitChildDeclaration(node, 0, domain)) {
      return null;
    } else if (!this.visitChild(node, 2)) {
      return null;
    }

    this.locals.endScope(node.from);
    return LogicT;
  }

  private visitNegation(node: AstNode): ExpressionType | null {
    return this.visitAllAndReturn(node, LogicT);
  }

  private visitLogicBinary(node: AstNode): ExpressionType | null {
    return this.visitAllAndReturn(node, LogicT);
  }

  private visitEquals(node: AstNode): ExpressionType | null {
    const type1 = this.childTypification(node, 0);
    if (type1 === null) {
      return null;
    }

    const type2 = this.childTypification(node, 1);
    if (type2 === null) {
      return null;

    }
    if (!checkCompatibility(type1, type2)) {
      return this.onError(
        RSErrorCode.typesNotCompatible,
        node.children[1].from,
        [labelType(type1), labelType(type2)]
      );
    }
    return LogicT;
  }

  private visitSetexprPredicate(node: AstNode): ExpressionType | null {
    let type2 = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    if (type2 === null) {
      return null;
    }
    const isSubset = this.isSubset(node.typeID as TokenID);
    if (isSubset) {
      type2 = bool(type2);
    }
    const type1 = this.childTypification(node, 0);
    if (type1 === null) {
      return null;
    }

    if (!checkCompatibility(type1, type2)) {
      if (isSubset) {
        return this.onError(
          RSErrorCode.typesNotEqual,
          node.children[1].from,
          [labelType(type1), labelType(type2)]
        );
      } else {
        return this.onError(
          RSErrorCode.invalidElementPredicate,
          node.children[1].from,
          [labelType(type1), labelToken(node.typeID as TokenID), labelType(bool(type2))]
        );
      }
    }
    return LogicT;
  }

  private visitDecart(node: AstNode): ExpressionType | null {
    const factors: Typification[] = [];
    for (let child = 0; child < node.children.length; child++) {
      const type = this.childTypeDebool(node, child, RSErrorCode.invalidDecart);
      if (type === null) {
        return null;
      } else {
        factors.push(type);
      }
    }
    return bool(tuple(factors));
  }

  private visitBoolean(node: AstNode): ExpressionType | null {
    const type = this.childTypeDebool(node, 0, RSErrorCode.invalidBoolean);
    if (type === null) {
      return null;
    }
    return bool(bool(type));
  }

  private visitTuple(node: AstNode): ExpressionType | null {
    const components: Typification[] = [];
    for (let child = 0; child < node.children.length; child++) {
      const type = this.childTypification(node, child);
      if (type === null) {
        return null;
      }
      components.push(type);
    }
    return tuple(components);
  }

  private visitEnumeration(node: AstNode): ExpressionType | null {
    let type: ExpressionType | null = this.childTypification(node, 0);
    if (type === null) {
      return null;
    }
    for (let child = 1; child < node.children.length; child++) {
      const childType = this.childTypification(node, child);
      if (childType === null) {
        return null;
      }

      const merge = mergeTypifications(type, childType);
      if (merge === null) {
        return this.onError(
          RSErrorCode.invalidEnumeration,
          node.children[child].from,
          [labelType(type), labelType(childType)]);
      }
      type = merge;
    }
    return bool(type);
  }

  private visitBool(node: AstNode): ExpressionType | null {
    return this.visitEnumeration(node);
  }

  private visitDebool(node: AstNode): ExpressionType | null {
    return this.childTypeDebool(node, 0, RSErrorCode.invalidDebool);
  }

  private visitSetexprBinary(node: AstNode): ExpressionType | null {
    const type1 = this.childTypeDebool(node, 0, RSErrorCode.invalidTypeOperation);
    if (type1 === null) {
      return null;
    }

    const type2 = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    if (type2 === null) {
      return null;
    }

    const result = mergeTypifications(type1, type2);
    if (result === null) {
      return this.onError(
        RSErrorCode.typesNotEqual,
        node.children[1].from,
        [labelType(bool(type1)), labelType(bool(type2))]);
    }
    return bool(result);
  }

  private visitProjectSet(node: AstNode): ExpressionType | null {
    const argument = this.childTypeDebool(node, 0, RSErrorCode.invalidProjectionSet);
    if (argument === null) {
      return null;
    }
    if (argument.typeID === TypeID.anyTypification) {
      return EmptySetT;
    }
    if (argument.typeID !== TypeID.tuple) {
      return this.onError(
        RSErrorCode.invalidProjectionSet,
        node.children[0].from,
        [labelRSLangNode(node), labelType(bool(argument))]
      );
    }

    const indices = getNodeIndices(node);
    const components: Typification[] = [];
    for (const index of indices) {
      if (index < 1 || index > argument.factors.length) {
        return this.onError(RSErrorCode.invalidProjectionSet,
          node.children[0].from,
          [labelRSLangNode(node), labelType(bool(argument))]
        );
      } else {
        components.push(component(argument, index));
      }
    }
    if (components.length === 1) {
      return bool(components[0]);
    } else {
      return bool(tuple(components));
    }
  }

  private visitProjectTuple(node: AstNode): ExpressionType | null {
    const argument = this.childTypification(node, 0);
    if (argument === null) {
      return null;
    }
    if (argument.typeID === TypeID.anyTypification) {
      return argument;
    }
    if (argument.typeID !== TypeID.tuple) {
      return this.onError(
        RSErrorCode.invalidProjectionTuple,
        node.children[0].from,
        [labelRSLangNode(node), labelType(argument)]
      );
    }

    const indices = getNodeIndices(node);
    const components: Typification[] = [];
    for (const index of indices) {
      if (index < 1 || index > argument.factors.length) {
        return this.onError(
          RSErrorCode.invalidProjectionTuple,
          node.children[0].from,
          [labelRSLangNode(node), labelType(argument)]);
      } else {
        components.push(component(argument, index));
      }
    }
    if (components.length === 1) {
      return components[0];
    } else {
      return tuple(components);
    }
  }

  private visitFilter(node: AstNode): ExpressionType | null {
    const indices = getNodeIndices(node);
    const tupleParam = indices.length === node.children.length - 1;
    if (!tupleParam && node.children.length > 2) {
      return this.onError(RSErrorCode.invalidFilterArity, node.from);
    }

    const argument = this.childTypification(node, node.children.length - 1);
    if (argument === null) {
      return null;
    }
    if (argument.typeID === TypeID.anyTypification ||
      (argument.typeID === TypeID.collection && argument.base.typeID === TypeID.anyTypification)
    ) {
      return EmptySetT;
    }
    if (argument.typeID !== TypeID.collection || argument.base.typeID !== TypeID.tuple) {
      return this.onError(
        RSErrorCode.invalidFilterArgumentType,
        node.children[node.children.length - 1].from,
        [labelRSLangNode(node), labelType(argument)]
      );
    }

    const argBase = debool(argument) as EchelonTuple;
    const bases: Typification[] = [];
    for (const index of indices) {
      if (index < 1 || index > argBase.factors.length) {
        return this.onError(
          RSErrorCode.invalidFilterArgumentType,
          node.children[node.children.length - 1].from,
          [labelRSLangNode(node), labelType(argument)]
        );
      }
      bases.push(component(argBase, index));
    }

    if (tupleParam) {
      for (let child = 0; child + 1 < node.children.length; child++) {
        const param = this.childTypification(node, child);
        if (param === null) {
          return null;
        }
        if (param.typeID !== TypeID.collection || !checkCompatibility(bases[child], debool(param))) {
          return this.onError(
            RSErrorCode.typesNotEqual,
            node.children[child].from,
            [labelType(param), labelType(bool(bases[child]))]
          );
        }
      }
    } else {
      const param = this.childTypification(node, 0);
      if (param === null) {
        return null;
      }
      const paramType = param;
      const expected = bool(tuple(bases));
      if (paramType.typeID !== TypeID.collection || !checkCompatibility(expected, paramType)) {
        return this.onError(
          RSErrorCode.typesNotEqual,
          node.children[0].from,
          [labelType(paramType), labelType(expected)]
        );
      }
    }
    return argument;
  }

  private visitReduce(node: AstNode): ExpressionType | null {
    const argument = this.childTypification(node, 0);
    if (argument === null) {
      return null;
    }
    if (argument.typeID === TypeID.anyTypification ||
      (argument.typeID === TypeID.collection && argument.base.typeID === TypeID.anyTypification)
    ) {
      return EmptySetT;
    }
    if (argument.typeID !== TypeID.collection || argument.base.typeID !== TypeID.collection) {
      return this.onError(
        RSErrorCode.invalidReduce,
        node.from + 1,
        [labelType(argument)]
      );
    }
    return debool(argument);
  }

  private visitArgumentsEnum(node: AstNode): ExpressionType | null {
    return this.visitAllAndReturn(node, LogicT);
  }

  private visitDeclarative(node: AstNode): ExpressionType | null {
    this.locals.startScope();

    const domain = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    if (domain === null) {
      return null;
    } else if (!this.visitChildDeclaration(node, 0, domain)) {
      return null;
    } else if (!this.visitChild(node, 2)) {
      return null;
    }

    this.locals.endScope(node.from);
    return bool(domain);
  }

  private visitImperative(node: AstNode): ExpressionType | null {
    this.locals.startScope();

    for (let child = 1; child < node.children.length; child++) {
      if (this.visitChild(node, child) === null) {
        return null;
      }
    }

    const type = this.childTypification(node, 0);
    if (type === null) {
      return null;
    }

    this.locals.endScope(node.from);
    return bool(type);
  }

  private visitIterate(node: AstNode): ExpressionType | null {
    const domain = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    if (domain === null) {
      return null;
    }
    if (!this.visitChildDeclaration(node, 0, domain)) {
      return null;
    }
    return LogicT;
  }

  private visitAssign(node: AstNode): ExpressionType | null {
    const domain = this.childTypification(node, 1);
    if (domain === null) {
      return null;
    }
    if (!this.visitChildDeclaration(node, 0, domain)) {
      return null;
    }
    return LogicT;
  }

  private visitRecursion(node: AstNode): ExpressionType | null {
    this.locals.startScope();

    const initType = this.childTypification(node, 1);
    if (initType === null) {
      return null;
    }
    if (!this.visitChildDeclaration(node, 0, initType)) {
      return null;
    }

    const isFull = node.typeID === TokenID.NT_RECURSIVE_FULL;
    const iterationIndex = isFull ? 3 : 2;

    let iterationValue = this.childTypification(node, iterationIndex);
    if (iterationValue === null) {
      return null;
    }
    if (!checkCompatibility(iterationValue, initType)) {
      return this.onError(
        RSErrorCode.typesNotEqual,
        node.children[iterationIndex].from,
        [labelType(iterationValue), labelType(initType)]
      );
    }

    if (hasGenerics(iterationValue)) {
      for (let retries = TypeAuditor.TYPE_DEDUCTION_DEPTH; retries > 0; retries--) {
        this.locals.endScope(node.from);
        this.locals.clearUnused();
        this.locals.startScope();
        if (!this.visitChildDeclaration(node, 0, iterationValue)) {
          return null;
        }
        const newIteration = this.childTypification(node, iterationIndex);
        if (newIteration === null) {
          return null;
        }
        if (checkEquality(newIteration, iterationValue)) {
          break;
        }
        iterationValue = newIteration;
      }
    }

    if (isFull) {
      if (!this.visitChild(node, 2)) {
        return null;
      }
    }

    this.locals.endScope(node.from);
    return iterationValue;
  }

  private isSubset(token: TokenID): boolean {
    return token === TokenID.SUBSET || token === TokenID.SUBSET_OR_EQ || token === TokenID.NOT_SUBSET;
  }

  private isInsideFuncArgument(node: AstNode): boolean {
    while (node.parent && node.parent !== node) {
      if (node.typeID === TokenID.NT_ARGUMENTS) return true;
      node = node.parent;
    }
    return false;
  }

  private checkFuncArguments(node: AstNode, alias: string, type: Parametrized): Map<string, Typification> | null {
    if (node.children.length - 1 !== type.args.length) {
      this.onError(
        RSErrorCode.invalidArgsArity,
        node.children[1].from, [String(type.args.length),
        String(node.children.length - 1)]
      );
      return null;
    }

    const substitutes = new Map<string, Typification>();
    for (let child = 1; child < node.children.length; child++) {
      const childType = this.childTypification(node, child);
      if (childType === null) {
        return null;
      }
      const argType = mangleRadicals(alias, type.args[child - 1].type);
      if (!compareTemplated(substitutes, argType, childType)) {
        this.onError(
          RSErrorCode.invalidArgumentType,
          node.children[child].from, [`${type.args[child - 1].alias}∈${labelType(argType)}`, labelType(childType)]
        );
        return null;
      }
    }
    return substitutes;
  }
}

// ========= Internals ========
function mangleRadicals(funcName: string, type: Typification): Typification {
  switch (type.typeID) {
    default:
      throw new Error(`Unexpected type: ${type.typeID}`);
    case TypeID.integer:
      return type;
    case TypeID.basic: {
      if (isRadical(type.baseID)) {
        return {
          typeID: type.typeID,
          baseID: type.baseID + funcName
        };
      }
      return type;
    }
    case TypeID.collection: {
      return {
        typeID: type.typeID,
        base: mangleRadicals(funcName, debool(type))
      };
    }
    case TypeID.tuple: {
      const factors: Typification[] = [];
      for (let index = 1; index <= type.factors.length; ++index) {
        factors.push(mangleRadicals(funcName, component(type, index)));
      }
      return {
        typeID: type.typeID,
        factors: factors
      };
    }
  }
}

/** Local variable data. */
interface LocalData {
  alias: string;
  level: number;
  useCount: number;
  type: Typification;
}

/** Local variables context. */
class LocalContext {
  private onError: (code: RSErrorCode, position: number, params: string[]) => null;

  public data: LocalData[] = [];

  constructor(onError: (code: RSErrorCode, position: number, params: string[]) => null) {
    this.onError = onError;
  }

  startScope(): void {
    for (const local of this.data) {
      if (local.level > 0) {
        local.level = local.level + 1;
      }
    }
  }

  endScope(pos: number, skipUnused: boolean = false): void {
    for (const local of this.data) {
      local.level--;
      if (!skipUnused && local.level === 0 && local.useCount === 0) {
        this.onError(RSErrorCode.localNotUsed, pos, [local.alias]);
      }
    }
  }

  clearUnused(): void {
    this.data = this.data.filter(data => data.level > 0);
  };

  pushLocal(alias: string, type: Typification, pos: number): boolean {
    const existing = this.data.find(data => data.alias === alias);
    if (existing) {
      if (existing.level > 0) {
        this.onError(RSErrorCode.localShadowing, pos, [alias]);
        return false;
      } else {
        this.onError(RSErrorCode.localDoubleDeclare, pos, [alias]);
        const index = this.data.indexOf(existing);
        if (index !== -1) {
          this.data.splice(index, 1);
        }
      }
    }
    this.data.push({ alias, type, level: 1, useCount: 0 });
    return true;
  }

  getLocalType(alias: string, pos: number): Typification | null {
    const local = this.data.find(data => data.alias === alias);
    if (local === undefined) {
      this.onError(RSErrorCode.localUndeclared, pos, [alias]);
      return null;
    } else if (local.level < 1) {
      this.onError(RSErrorCode.localOutOfScope, pos, [alias]);
      return null;
    } else {
      local.useCount++;
      return local.type;
    }
  }
}