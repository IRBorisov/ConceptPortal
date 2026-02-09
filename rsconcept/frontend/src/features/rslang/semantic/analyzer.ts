import { type AstNode, buildTree } from '@/utils/parsing';

import { RSErrorCode, type RSErrorDescription } from '../error';
import { labelTypeClass } from '../labels';
import { normalizeAST } from '../parser/normalize';
import { parser as rslangParser } from '../parser/parser';
import { extractSyntaxErrors } from '../parser/syntax-errors';
import { TokenID } from '../parser/token';

import { TypeAuditor } from './type-auditor';
import {
  basic, bool, constant, debool,
  type ExpressionType, type TypeClass, type TypeContext, TypeID
} from './typification';
import { getTypeClass } from './typification-api';
import { ValueAuditor } from './value-auditor';
import { ValueClass, type ValueClassContext } from './value-class';

export interface AnalysisBase {
  success: boolean;
  ast: AstNode | null;
  type: ExpressionType | null;
  valueClass: ValueClass | null;
}

export interface AnalysisFull extends AnalysisBase {
  errors: RSErrorDescription[];
}

export interface AnalysisOptions {
  expected?: TypeClass;
  isDomain?: boolean;
}

export class RSLangAnalyzer {
  private typeContext: TypeContext = new Map<string, ExpressionType>();
  private valueContext: ValueClassContext = new Map<string, ValueClass>();
  private typeAuditor: TypeAuditor = new TypeAuditor(this.typeContext);
  private valueAuditor: ValueAuditor = new ValueAuditor(this.valueContext);

  public addBase(alias: string, isNumeric: boolean = false): void {
    if (isNumeric) {
      this.typeContext.set(alias, bool(constant(alias)));
      this.valueContext.set(alias, ValueClass.VALUE);
    } else {
      this.typeContext.set(alias, bool(basic(alias)));
      this.valueContext.set(alias, ValueClass.VALUE);
    }
  }

  public setGlobal(alias: string, type: ExpressionType | null, value: ValueClass | null): void {
    if (type) {
      this.typeContext.set(alias, type);
    }
    if (value) {
      this.valueContext.set(alias, value);
    }
  }

  public checkFast(expression: string, options?: AnalysisOptions): AnalysisBase {
    if (expression.length === 0) {
      return { success: false, type: null, valueClass: null, ast: null };
    }
    const ast = this.parse(expression);
    if (ast.hasError) {
      return { success: false, type: null, valueClass: null, ast: ast };
    }
    const type = this.typeAuditor.run(ast);
    if (type === null) {
      return { success: false, type: null, valueClass: null, ast: ast };
    }

    if (options?.isDomain) {
      if (!isStructureDomain(ast) || type.typeID !== TypeID.collection) {
        return { success: false, type: null, valueClass: null, ast: ast };
      }
      return { success: true, type: debool(type), valueClass: ValueClass.VALUE, ast: ast };
    }
    if (options?.expected && getTypeClass(type.typeID) !== options.expected) {
      return { success: false, type: null, valueClass: null, ast: ast };
    }

    return {
      success: true,
      type: type,
      valueClass: options?.isDomain ? ValueClass.VALUE : this.valueAuditor.run(ast),
      ast: ast
    };
  }

  public checkFull(expression: string, options?: AnalysisOptions): AnalysisFull {
    const errors: RSErrorDescription[] = [];
    const reporter = (error: RSErrorDescription) => {
      errors.push(error);
    };
    if (expression.length === 0) {
      reporter({ code: RSErrorCode.cstEmptyDerived, position: 0 });
      return { success: false, type: null, valueClass: null, errors: errors, ast: null };
    }
    const ast = this.parse(expression);
    if (ast.hasError) {
      extractSyntaxErrors(ast, reporter);
      return { success: false, type: null, valueClass: null, errors: errors, ast: ast };
    }

    const type = this.typeAuditor.run(ast, reporter);
    if (type === null) {
      return { success: false, type: null, valueClass: null, errors: errors, ast: ast };
    }

    if (options?.isDomain) {
      if (!isStructureDomain(ast) || type.typeID !== TypeID.collection) {
        reporter({ code: RSErrorCode.globalStructure, position: ast.from });
        return { success: false, type: null, valueClass: null, errors: errors, ast: ast };
      }
      return { success: true, type: debool(type), valueClass: ValueClass.VALUE, errors: errors, ast: ast };
    }
    if (options?.expected && getTypeClass(type.typeID) !== options.expected) {
      reporter({ code: RSErrorCode.expectedType, position: ast.from, params: [labelTypeClass(options.expected)] });
      return { success: false, type: null, valueClass: null, errors: errors, ast: ast };
    }

    return {
      success: true,
      type: type,
      valueClass: options?.isDomain ? ValueClass.VALUE : this.valueAuditor.run(ast, reporter),
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
