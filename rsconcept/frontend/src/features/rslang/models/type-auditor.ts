/**
 * Module: Type auditor for AST type checking.
 */

import { type AstNode, getNodeText } from '@/utils/parsing';

import { labelRSLangNode, labelToken, labelType } from '../labels';

import { type ErrorReporter, RSErrorCode } from './error';
import { TokenID } from './language';
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

  private currentType: ExpressionType | null = null;
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
    const success = this.dispatchVisit(ast);
    if (!success) {
      return null;
    }
    return this.currentType;
  }

  private clear(): void {
    this.locals = new LocalContext(this.onError.bind(this));
    this.currentType = null;
  }

  private dispatchVisit(node: AstNode): boolean {
    switch (node.typeID) {
      case TokenID.ID_GLOBAL:
      case TokenID.ID_FUNCTION:
      case TokenID.ID_PREDICATE:
        return this.visitGlobal(node);

      case TokenID.ID_LOCAL: return this.visitLocal(node);
      case TokenID.ID_RADICAL: return this.visitRadical(node);

      case TokenID.LIT_INTEGER: return this.setCurrent(IntegerT);
      case TokenID.LIT_WHOLE_NUMBERS: return this.setCurrent(bool(IntegerT));
      case TokenID.LIT_EMPTYSET: return this.visitEmptySet(node);

      case TokenID.NT_TUPLE_DECL: return this.visitTupleDeclaration(node);
      case TokenID.NT_ENUM_DECL: return this.visitEnumDeclaration(node);
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

      default:
        return false;
    }
  }

  private setCurrent(type: ExpressionType | null): boolean {
    this.currentType = type;
    return true;
  }

  private onError(code: RSErrorCode, position: number, params?: string[]): boolean {
    if (this.reporter) {
      this.reporter({ code, position, params });
    }
    return false;
  }

  private visitChild(node: AstNode, index: number): boolean {
    if (index >= node.children.length) {
      return false;
    }
    return this.dispatchVisit(node.children[index]);
  }

  private visitChildDeclaration(node: AstNode, index: number, domain: Typification): boolean {
    this.currentType = domain;
    if (!this.visitChild(node, index)) {
      return false;
    }
    return this.setCurrent(null);
  }

  private visitAllAndSetCurrent(node: AstNode, type: ExpressionType | null): boolean {
    for (const child of node.children) {
      if (type !== null) {
        this.setCurrent(null);
      }
      if (!this.dispatchVisit(child)) {
        return false;
      }
    }
    return this.setCurrent(type);
  }

  private childType(node: AstNode, index: number): ExpressionType | null {
    if (index >= node.children.length) {
      return null;
    }
    const savedType = this.currentType;
    const visitSuccess = this.dispatchVisit(node.children[index]);
    const result = this.currentType;
    this.currentType = savedType;
    if (!visitSuccess) {
      return null;
    } else {
      return result;
    }
  }

  private childTypification(node: AstNode, index: number): Typification | null {
    const result = this.childType(node, index);
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

  private visitLocal(node: AstNode): boolean {
    const localName = getNodeText(node);
    if (this.currentType !== null) {
      if (!isTypification(this.currentType)) {
        return false;
      }
      return this.locals.pushLocal(localName, this.currentType as Typification, node.from);
    } else {
      const local = this.locals.getLocalType(localName, node.from);
      if (local === null) {
        return false;
      }
      return this.setCurrent(local);
    }
  }

  private visitGlobal(node: AstNode): boolean {
    const alias = getNodeText(node);
    const type = this.context.get(alias);
    if (!type) {
      return this.onError(RSErrorCode.globalNotTyped, node.from, [alias]);
    }
    return this.setCurrent(type);
  }

  private visitFunctionDefinition(node: AstNode): boolean {
    this.locals.startScope();
    if (!this.visitChild(node, 0)) {
      return false;
    }

    const args: Argument[] = [];
    for (const local of this.locals.data) {
      if (local.level === 1) {
        args.push({ alias: local.alias, type: local.type });
      }
    }

    const result = this.childType(node, 1);
    if (result === null || result.typeID === TypeID.function || result.typeID === TypeID.predicate) {
      return false;
    }
    this.locals.endScope(node.from);
    if (result.typeID === TypeID.logic) {
      return this.setCurrent({
        typeID: TypeID.predicate,
        result: result,
        args: args
      });
    } else {
      return this.setCurrent({
        typeID: TypeID.function,
        result: result,
        args: args
      });
    }
  }

  private visitFunctionCall(node: AstNode): boolean {
    const funcName = getNodeText(node.children[0]);
    const funcType = this.context.get(funcName);
    if (funcType?.typeID !== TypeID.function && funcType?.typeID !== TypeID.predicate) {
      return this.onError(RSErrorCode.globalNotTyped, node.from, [funcName]);
    }
    const substitutes = this.checkFuncArguments(node, funcName, funcType);
    if (substitutes === null) {
      return false;
    }
    if (funcType.result.typeID === TypeID.logic) {
      return this.setCurrent(funcType.result);
    } else {
      const result = mangleRadicals(funcName, funcType.result);
      if (substitutes.size > 0) {
        substituteBase(result, substitutes);
      }
      return this.setCurrent(result);
    }
  }

  private visitRadical(node: AstNode): boolean {
    const alias = getNodeText(node);
    if (!this.isInsideFuncArgument(node)) {
      return this.onError(RSErrorCode.radicalUsage, node.from, [alias]);
    }
    return this.setCurrent(bool({ typeID: TypeID.basic, baseID: alias }));
  }

  private visitEmptySet(node: AstNode): boolean {
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
    return this.setCurrent(EmptySetT);
  }

  private visitTupleDeclaration(node: AstNode): boolean {
    const type = this.currentType;
    if (!type || !isTypification(type)) {
      return false;
    }
    if (type.typeID !== TypeID.tuple || type.factors.length !== node.children.length) {
      return this.onError(RSErrorCode.invalidCortegeDeclare, node.children[0].from);
    }
    for (let child = 0; child < node.children.length; child++) {
      this.currentType = component(type, child + 1);
      if (!this.visitChild(node, child)) {
        return false;
      }
    }
    return this.setCurrent(type);
  }

  private visitArgument(node: AstNode): boolean {
    const domain = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    if (domain === null) {
      return false;
    }
    this.currentType = domain;
    return this.visitChild(node, 0) && this.setCurrent(null);
  }

  private visitCard(node: AstNode): boolean {
    return (
      this.childTypeDebool(node, 0, RSErrorCode.invalidCard) !== null &&
      this.setCurrent(IntegerT)
    );
  }

  private visitArithmetic(node: AstNode): boolean {
    const type1 = this.childTypification(node, 0);
    if (type1 === null) {
      return false;
    }
    if (!('isArithmetic' in type1 && type1.isArithmetic)) {
      return this.onError(RSErrorCode.arithmeticNotSupported, node.children[0].from, [labelType(type1)]);
    }

    const type2 = this.childTypification(node, 1);
    if (type2 === null) {
      return false;
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
    return this.setCurrent(result);
  }

  private visitIntegerPredicate(node: AstNode): boolean {
    const type1 = this.childTypification(node, 0);
    if (type1 === null) {
      return false;
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
      return false;
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
    return this.setCurrent(LogicT);
  }

  private visitQuantifier(node: AstNode): boolean {
    this.locals.startScope();

    const domain = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    if (domain === null) {
      return false;
    } else if (!this.visitChildDeclaration(node, 0, domain)) {
      return false;
    } else if (!this.visitChild(node, 2)) {
      return false;
    }

    this.locals.endScope(node.from);
    return this.setCurrent(LogicT);
  }

  private visitNegation(node: AstNode): boolean {
    return this.visitAllAndSetCurrent(node, LogicT);
  }

  private visitLogicBinary(node: AstNode): boolean {
    return this.visitAllAndSetCurrent(node, LogicT);
  }

  private visitEquals(node: AstNode): boolean {
    const type1 = this.childTypification(node, 0);
    if (type1 === null) {
      return false;
    }

    const type2 = this.childTypification(node, 1);
    if (type2 === null) {
      return false;

    }
    if (!checkCompatibility(type1, type2)) {
      return this.onError(
        RSErrorCode.typesNotCompatible,
        node.children[1].from,
        [labelType(type1), labelType(type2)]
      );
    }
    return this.setCurrent(LogicT);
  }

  private visitSetexprPredicate(node: AstNode): boolean {
    let type2 = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    if (type2 === null) {
      return false;
    }
    const isSubset = this.isSubset(node.typeID as TokenID);
    if (isSubset) {
      type2 = bool(type2);
    }
    const type1 = this.childTypification(node, 0);
    if (type1 === null) {
      return false;
    }

    if (!checkCompatibility(type1, type2)) {
      if (isSubset) {
        this.onError(
          RSErrorCode.typesNotEqual,
          node.children[1].from,
          [labelType(type1), labelType(type2)]
        );
      } else {
        this.onError(
          RSErrorCode.invalidElementPredicate,
          node.children[1].from,
          [labelType(type1), labelToken(node.typeID as TokenID), labelType(bool(type2))]
        );
      }
      return false;
    }
    return this.setCurrent(LogicT);
  }

  private visitDecart(node: AstNode): boolean {
    const factors: Typification[] = [];
    for (let child = 0; child < node.children.length; child++) {
      const type = this.childTypeDebool(node, child, RSErrorCode.invalidDecart);
      if (type === null) {
        return false;
      } else {
        factors.push(type);
      }
    }
    return this.setCurrent(bool(tuple(factors)));
  }

  private visitBoolean(node: AstNode): boolean {
    const type = this.childTypeDebool(node, 0, RSErrorCode.invalidBoolean);
    if (type === null) {
      return false;
    }
    return this.setCurrent(bool(bool(type)));
  }

  private visitTuple(node: AstNode): boolean {
    const components: Typification[] = [];
    for (let child = 0; child < node.children.length; child++) {
      const type = this.childTypification(node, child);
      if (type === null) {
        return false;
      }
      components.push(type);
    }
    return this.setCurrent(tuple(components));
  }

  private visitEnumeration(node: AstNode): boolean {
    let type: ExpressionType | null = this.childTypification(node, 0);
    if (type === null) {
      return false;
    }
    for (let child = 1; child < node.children.length; child++) {
      const childType = this.childTypification(node, child);
      if (childType === null) {
        return false;
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
    return this.setCurrent(bool(type));
  }

  private visitBool(node: AstNode): boolean {
    return this.visitEnumeration(node);
  }

  private visitDebool(node: AstNode): boolean {
    const type = this.childTypeDebool(node, 0, RSErrorCode.invalidDebool);
    if (type === null) {
      return false;
    }
    return this.setCurrent(type);
  }

  private visitSetexprBinary(node: AstNode): boolean {
    const type1 = this.childTypeDebool(node, 0, RSErrorCode.invalidTypeOperation);
    if (type1 === null) {
      return false;
    }

    const type2 = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    if (type2 === null) {
      return false;
    }

    const result = mergeTypifications(type1, type2);
    if (result === null) {
      return this.onError(
        RSErrorCode.typesNotEqual,
        node.children[1].from,
        [labelType(bool(type1)), labelType(bool(type2))]);
    }
    return this.setCurrent(bool(result));
  }

  private visitProjectSet(node: AstNode): boolean {
    const argument = this.childTypeDebool(node, 0, RSErrorCode.invalidProjectionSet);
    if (argument === null) {
      return false;
    }
    if (argument.typeID === TypeID.anyTypification) {
      return this.setCurrent(EmptySetT);
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
      return this.setCurrent(bool(components[0]));
    } else {
      return this.setCurrent(bool(tuple(components)));
    }
  }

  private visitProjectTuple(node: AstNode): boolean {
    const argument = this.childTypification(node, 0);
    if (argument === null) {
      return false;
    }
    if (argument.typeID === TypeID.anyTypification) {
      return this.setCurrent(argument);
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
      return this.setCurrent(components[0]);
    } else {
      return this.setCurrent(tuple(components));
    }
  }

  private visitFilter(node: AstNode): boolean {
    const indices = getNodeIndices(node);
    const tupleParam = indices.length === node.children.length - 1;
    if (!tupleParam && node.children.length > 2) {
      return this.onError(RSErrorCode.invalidFilterArity, node.from);
    }

    const argument = this.childTypification(node, node.children.length - 1);
    if (argument === null) {
      return false;
    }
    if (argument.typeID === TypeID.anyTypification ||
      (argument.typeID === TypeID.collection && argument.base.typeID === TypeID.anyTypification)
    ) {
      return this.setCurrent(EmptySetT);
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
          return false;
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
        return false;
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
    return this.setCurrent(argument);
  }

  private visitReduce(node: AstNode): boolean {
    const argument = this.childTypification(node, 0);
    if (argument === null) {
      return false;
    }
    if (argument.typeID === TypeID.anyTypification ||
      (argument.typeID === TypeID.collection && argument.base.typeID === TypeID.anyTypification)
    ) {
      return this.setCurrent(EmptySetT);
    }
    if (argument.typeID !== TypeID.collection || argument.base.typeID !== TypeID.collection) {
      return this.onError(
        RSErrorCode.invalidReduce,
        node.from + 1,
        [labelType(argument)]
      );
    }
    return this.setCurrent(debool(argument));
  }

  private visitEnumDeclaration(node: AstNode): boolean {
    return this.visitAllAndSetCurrent(node, null);
  }

  private visitArgumentsEnum(node: AstNode): boolean {
    return this.visitAllAndSetCurrent(node, null);
  }

  private visitDeclarative(node: AstNode): boolean {
    this.locals.startScope();

    const domain = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    if (domain === null) {
      return false;
    } else if (!this.visitChildDeclaration(node, 0, domain)) {
      return false;
    } else if (!this.visitChild(node, 2)) {
      return false;
    }

    this.locals.endScope(node.from);
    return this.setCurrent(bool(domain));
  }

  private visitImperative(node: AstNode): boolean {
    this.locals.startScope();

    for (let child = 1; child < node.children.length; child++) {
      if (!this.visitChild(node, child)) {
        return false;
      }
    }

    this.setCurrent(null);
    const type = this.childTypification(node, 0);
    if (type === null) {
      return false;
    }

    this.locals.endScope(node.from);
    return this.setCurrent(bool(type));
  }

  private visitIterate(node: AstNode): boolean {
    const domain = this.childTypeDebool(node, 1, RSErrorCode.invalidTypeOperation);
    return domain !== null && this.visitChildDeclaration(node, 0, domain);
  }

  private visitAssign(node: AstNode): boolean {
    const domain = this.childTypification(node, 1);
    if (domain === null) {
      return false;
    }
    return this.visitChildDeclaration(node, 0, domain);
  }

  private visitRecursion(node: AstNode): boolean {
    this.locals.startScope();

    const initType = this.childTypification(node, 1);
    if (initType === null) {
      return false;
    }
    if (!this.visitChildDeclaration(node, 0, initType)) {
      return false;
    }

    const isFull = node.typeID === TokenID.NT_RECURSIVE_FULL;
    const iterationIndex = isFull ? 3 : 2;

    let iterationValue = this.childTypification(node, iterationIndex);
    if (iterationValue === null) {
      return false;
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
          return false;
        }
        const newIteration = this.childTypification(node, iterationIndex);
        if (newIteration === null) {
          return false;
        }
        if (checkEquality(newIteration, iterationValue)) {
          break;
        }
        iterationValue = newIteration;
      }
    }

    if (isFull) {
      if (!this.visitChild(node, 2)) {
        return false;
      }
    }

    this.locals.endScope(node.from);
    return this.setCurrent(iterationValue);
  }

  private isSubset(token: TokenID): boolean {
    return token === TokenID.SUBSET || token === TokenID.SUBSET_OR_EQ || token === TokenID.NOT_SUBSET;
  }

  private isInsideFuncArgument(node: AstNode): boolean {
    const predecessors = [];
    while (node.parent && node.parent !== node) {
      predecessors.push(node);
      node = node.parent;
    }
    return predecessors.some(n => n.typeID === TokenID.NT_ARGUMENTS);
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

function getNodeIndices(node: AstNode): number[] {
  if (node.data.dataType === 'string[]' && Array.isArray(node.data.value)) {
    return (node.data.value as string[]).map(s => parseInt(s, 10)).filter(n => !isNaN(n));
  }
  return [];
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
  private onError: (code: RSErrorCode, position: number, params: string[]) => boolean;

  public data: LocalData[] = [];

  constructor(onError: (code: RSErrorCode, position: number, params: string[]) => boolean) {
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