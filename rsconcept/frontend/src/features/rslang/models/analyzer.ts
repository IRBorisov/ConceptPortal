import { type AstNode, buildTree } from '@/utils/parsing';

import { labelTypeClass } from '../labels';
import { normalizeAST } from '../parser/normalize';
import { parser as rslangParser } from '../parser/parser';
import { extractSyntaxErrors } from '../parser/syntax-errors';

import { ValueClass } from './calculation';
import { RSErrorCode, type RSErrorDescription } from './error';
import { TokenID } from './language';
import { TypeAuditor } from './type-auditor';
import {
  basic, bool, constant, debool,
  type ExpressionType, type TypeClass, type TypeContext, TypeID
} from './typification';
import { getTypeClass } from './typification-api';

export interface AnalysisOutput {
  success: boolean;
  type: ExpressionType | null;
  valueClass: ValueClass;
  errors: RSErrorDescription[];
  ast: AstNode;
}

export interface AnalysisOptions {
  expected?: TypeClass;
  isDomain?: boolean;
}

export class RSLangAnalyzer {
  private typeContext: TypeContext = new Map<string, ExpressionType>();
  private typeAuditor: TypeAuditor = new TypeAuditor(this.typeContext);

  public addBase(alias: string, isNumeric: boolean = false): void {
    if (isNumeric) {
      this.typeContext.set(alias, bool(constant(alias)));
    } else {
      this.typeContext.set(alias, bool(basic(alias)));
    }
  }

  public setType(alias: string, type: ExpressionType): void {
    this.typeContext.set(alias, type);
  }

  public check(expression: string, options?: AnalysisOptions): AnalysisOutput {
    const errors: RSErrorDescription[] = [];
    const reporter = (error: RSErrorDescription) => {
      errors.push(error);
    };
    const ast = this.parse(expression);
    if (ast.hasError) {
      extractSyntaxErrors(ast, reporter);
      return { success: false, type: null, valueClass: ValueClass.INVALID, errors: errors, ast: ast };
    }

    let type = this.typeAuditor.run(ast, reporter);
    if (type === null) {
      return { success: false, type: null, valueClass: ValueClass.INVALID, errors: errors, ast: ast };
    }

    if (options?.isDomain) {
      if (!isStructureDomain(ast) || type.typeID !== TypeID.collection) {
        reporter({ code: RSErrorCode.globalStructure, position: ast.from });
        return { success: false, type: null, valueClass: ValueClass.INVALID, errors: errors, ast: ast };
      }
      type = debool(type);
    }
    if (options?.expected && getTypeClass(type.typeID) !== options.expected) {
      reporter({ code: RSErrorCode.expectedType, position: ast.from, params: [labelTypeClass(options.expected)] });
      return { success: false, type: null, valueClass: ValueClass.INVALID, errors: errors, ast: ast };
    }
    return {
      success: type !== null,
      type: type,
      valueClass: ValueClass.VALUE,
      errors: errors,
      ast: ast
    };
  }

  private parse(expression: string): AstNode {
    const tree = rslangParser.parse(expression);
    const ast = buildTree(tree.cursor());
    normalizeAST(ast, expression);
    return ast;
  }
};

// ======= Internals ========
function isStructureDomain(node: AstNode): boolean {
  switch (node.typeID) {
    case TokenID.LIT_WHOLE_NUMBERS:
    case TokenID.ID_GLOBAL:
    case TokenID.BOOLEAN:
    case TokenID.DECART:
    case TokenID.NT_ENUMERATION:
      break;
    default:
      return false;
  }
  for (const child of node.children) {
    if (!isStructureDomain(child)) {
      return false;
    }
  }
  return true;
}
