import { beforeEach, describe, expect, it } from 'vitest';

import { buildTree } from '@/utils/parsing';

import { RSErrorCode, type RSErrorDescription } from '../error';
import { normalizeAST } from '../parser/normalize';
import { parser as rslangParser } from '../parser/parser';

import { ValueAuditor } from './value-auditor';
import { ValueClass, type ValueClassContext } from './value-class';


// Helper to build AST
function buildAST(expression: string) {
	const tree = rslangParser.parse(expression);
	const ast = buildTree(tree.cursor());
	normalizeAST(ast, expression);
	return ast;
}

function setupValueContext(): ValueClassContext {
	const context: ValueClassContext = new Map();
	context.set('X1', ValueClass.VALUE);
	context.set('D1', ValueClass.VALUE);
	context.set('D2', ValueClass.PROPERTY);
	context.set('F1', ValueClass.VALUE);
	context.set('F2', ValueClass.PROPERTY);
	return context;
}

const correctValuesData = [
	// Literals and global identifiers
	['1', ValueClass.VALUE],
	['Z', ValueClass.PROPERTY],
	['X1', ValueClass.VALUE],
	['D1', ValueClass.VALUE],
	['D2', ValueClass.PROPERTY],
	// Functions
	['F1[X1, D1]', ValueClass.VALUE],
	['F2[X1, D1]', ValueClass.PROPERTY],
	['[a∈ℬ(R1), b∈ℬ(R2)] a⊆Pr1(b) & card(a)=card(b)', ValueClass.VALUE],
	['[a∈ℬ(R1)] ℬ(a)', ValueClass.PROPERTY],
	// Integral
	['1+2', ValueClass.VALUE],
	['1*2', ValueClass.VALUE],
	['card(X1)', ValueClass.VALUE],
	['card(D1)', ValueClass.VALUE],
	// Logical
	['1<1', ValueClass.VALUE],
	['1=1', ValueClass.VALUE],
	['1≠1', ValueClass.VALUE],
	['¬1=1', ValueClass.VALUE],
	['1=1 & 1=1', ValueClass.VALUE],
	['X1=X1', ValueClass.VALUE],
	['X1=∅', ValueClass.VALUE],
	['∃a∈X1 a=a', ValueClass.VALUE],
	['∃a∈D1 a=a', ValueClass.VALUE],
	['∀a∈X1 a=a', ValueClass.VALUE],
	['∀a∈D1 a=a', ValueClass.VALUE],
	['∀a,b∈D1 a=a', ValueClass.VALUE],
	['∀(a,b)∈D1 a=b', ValueClass.VALUE],
	// Set predicates
	['X1 ∈ D1', ValueClass.VALUE],
	['X1 ∈ D2', ValueClass.VALUE],
	['X1 ∉ D1', ValueClass.VALUE],
	['X1 ⊂ X1', ValueClass.VALUE],
	['X1 ⊆ D2', ValueClass.VALUE],
	// Constructors
	['ℬ(X1)', ValueClass.PROPERTY],
	['ℬ(D2)', ValueClass.PROPERTY],
	['X1×X1', ValueClass.VALUE],
	['X1×D2', ValueClass.PROPERTY],
	['D2×X1', ValueClass.PROPERTY],
	['(X1, D1)', ValueClass.VALUE],
	['{D1, X1}', ValueClass.VALUE],
	['D{t∈X1 | t=t}', ValueClass.VALUE],
	['D{t∈X1 | t∈D2}', ValueClass.VALUE],
	['D{t∈D2 | t=t}', ValueClass.PROPERTY],
	['R{a:=X1 | a\\a}', ValueClass.VALUE],
	['R{(a,b):=(0,1) | a<3 | (a+1, b+1)}', ValueClass.VALUE],
	['I{(a, b) | a:∈X1; X1\\X1=∅; b:=D1}', ValueClass.VALUE],
	// Set operations
	['X1∩X1', ValueClass.VALUE],
	['D2∩X1', ValueClass.VALUE],
	['X1∩D2', ValueClass.VALUE],
	['D2∩D2', ValueClass.PROPERTY],
	['X1\\X1', ValueClass.VALUE],
	['D2\\X1', ValueClass.PROPERTY],
	['X1\\D2', ValueClass.VALUE],
	['D2\\D2', ValueClass.PROPERTY],
	['X1∪X1', ValueClass.VALUE],
	['D2∪X1', ValueClass.PROPERTY],
	['X1∪D2', ValueClass.PROPERTY],
	['D2∪D2', ValueClass.PROPERTY],
	['pr1(D1)', ValueClass.VALUE],
	['Pr1(D1)', ValueClass.VALUE],
	['Pr1,2(D1)', ValueClass.VALUE],
	['Fi1[X1](D1)', ValueClass.VALUE],
	['Fi1,2[X1,D2](D1)', ValueClass.VALUE],
	['Fi1[X1](D2)', ValueClass.PROPERTY],
	['Fi1[D2](X1)', ValueClass.VALUE],
	['Fi1[D2](D2)', ValueClass.PROPERTY],
	['bool(X1)', ValueClass.VALUE],
	['bool(D1)', ValueClass.VALUE],
	['debool(D1)', ValueClass.VALUE],
	['red(D1)', ValueClass.VALUE],
];

const errorData = [
	// Identifiers
	['X42', { code: RSErrorCode.globalNoValue, position: 0, params: ['X42'] }],
	// Functions
	['F1[D2]', { code: RSErrorCode.invalidPropertyUsage, position: 3 }],
	['F42[D2]', { code: RSErrorCode.globalNoValue, position: 0, params: ['F42'] }],
	// Integral
	['card(D2)', { code: RSErrorCode.invalidPropertyUsage, position: 5 }],
	['card(D3)', { code: RSErrorCode.globalNoValue, position: 5, params: ['D3'] }],
	// Logical
	['D2=X1', { code: RSErrorCode.invalidPropertyUsage, position: 0 }],
	['X1=D2', { code: RSErrorCode.invalidPropertyUsage, position: 3 }],
	['∃a∈ℬ(X1) a=a', { code: RSErrorCode.invalidPropertyUsage, position: 3 }],
	['∃a∈D2 a=a', { code: RSErrorCode.invalidPropertyUsage, position: 3 }],
	['∀a∈D3 a=a', { code: RSErrorCode.globalNoValue, position: 3, params: ['D3'] }],
	['∃a∈D3 a=a', { code: RSErrorCode.globalNoValue, position: 3, params: ['D3'] }],
	// Set predicates
	['X1∈D3', { code: RSErrorCode.globalNoValue, position: 3, params: ['D3'] }],
	['D2∈X1', { code: RSErrorCode.invalidPropertyUsage, position: 0 }],
	['X1⊂D2', { code: RSErrorCode.invalidPropertyUsage, position: 3 }],
	['X1⊄D2', { code: RSErrorCode.invalidPropertyUsage, position: 3 }],
	// Constructors
	['ℬ(D3)', { code: RSErrorCode.globalNoValue, position: 2, params: ['D3'] }],
	['X1×D3', { code: RSErrorCode.globalNoValue, position: 3, params: ['D3'] }],
	['D3×X1', { code: RSErrorCode.globalNoValue, position: 0, params: ['D3'] }],
	['(X1, D2)', { code: RSErrorCode.invalidPropertyUsage, position: 5 }],
	['(D2, X1)', { code: RSErrorCode.invalidPropertyUsage, position: 1 }],
	['(X1, D3)', { code: RSErrorCode.globalNoValue, position: 5, params: ['D3'] }],
	['{X1, D2}', { code: RSErrorCode.invalidPropertyUsage, position: 5 }],
	['{D2, X1}', { code: RSErrorCode.invalidPropertyUsage, position: 1 }],
	['{X1, D3}', { code: RSErrorCode.globalNoValue, position: 5, params: ['D3'] }],
	['D{t ∈ D3 | t=t}', { code: RSErrorCode.globalNoValue, position: 6, params: ['D3'] }],
	['R{a := X1 | D2\\a}', { code: RSErrorCode.invalidPropertyUsage, position: 12 }],
	['R{a := X1 | D3\\a}', { code: RSErrorCode.globalNoValue, position: 12, params: ['D3'] }],
	['R{a := D2 | a\\a}', { code: RSErrorCode.invalidPropertyUsage, position: 7 }],
	['R{a := D3 | a\\a}', { code: RSErrorCode.globalNoValue, position: 7, params: ['D3'] }],
	['I{(a,b) | a:∈D2; X1\\X1=∅; b:=D1}', { code: RSErrorCode.invalidPropertyUsage, position: 13 }],
	['I{(a,b) | a:∈D3; X1\\X1=∅; b:=D1}', { code: RSErrorCode.globalNoValue, position: 13, params: ['D3'] }],
	['I{(a,b) | a:∈X1; D2\\X1=∅; b:=D1}', { code: RSErrorCode.invalidPropertyUsage, position: 17 }],
	['I{(a,b) | a:∈X1; D3\\X1=∅; b:=D1}', { code: RSErrorCode.globalNoValue, position: 17, params: ['D3'] }],
	['I{(a,b) | a:∈X1; X1\\X1=∅; b:=D2}', { code: RSErrorCode.invalidPropertyUsage, position: 29 }],
	['I{(a,b) | a:∈X1; X1\\X1=∅; b:=D3}', { code: RSErrorCode.globalNoValue, position: 29, params: ['D3'] }],
	// Set operations
	['pr1(D2)', { code: RSErrorCode.invalidPropertyUsage, position: 4 }],
	['pr1(D3)', { code: RSErrorCode.globalNoValue, position: 4, params: ['D3'] }],
	['Pr1(D2)', { code: RSErrorCode.invalidPropertyUsage, position: 4 }],
	['Pr1(D3)', { code: RSErrorCode.globalNoValue, position: 4, params: ['D3'] }],
	['Fi1[D3](X1)', { code: RSErrorCode.globalNoValue, position: 4, params: ['D3'] }],
	['Fi1[X1](D3)', { code: RSErrorCode.globalNoValue, position: 8, params: ['D3'] }],
	['bool(D2)', { code: RSErrorCode.invalidPropertyUsage, position: 5 }],
	['bool(D3)', { code: RSErrorCode.globalNoValue, position: 5, params: ['D3'] }],
	['debool(D2)', { code: RSErrorCode.invalidPropertyUsage, position: 7 }],
	['debool(D3)', { code: RSErrorCode.globalNoValue, position: 7, params: ['D3'] }],
	['red(D2)', { code: RSErrorCode.invalidPropertyUsage, position: 4 }],
	['red(D3)', { code: RSErrorCode.globalNoValue, position: 4, params: ['D3'] }],
];

describe('ValueAuditor', () => {
	let valueContext: ValueClassContext;
	let valueAuditor: ValueAuditor;
	let errors: RSErrorDescription[];

	beforeEach(() => {
		valueContext = setupValueContext();
		valueAuditor = new ValueAuditor(valueContext);
		errors = [];
	});

	function expectValue(input: string, expectedValue: string) {
		const ast = buildAST(input);
		expect(ast.hasError).toBe(false);
		const result = valueAuditor.run(ast, error => (errors.push(error)));
		expect(result).toBe(expectedValue);
	}

	function expectError(input: string, expectedError: RSErrorDescription) {
		const ast = buildAST(input);
		expect(ast.hasError).toBe(false);
		expect(errors.length).toBe(0);

		valueAuditor.run(ast, error => (errors.push(error)));
		expect(errors.length).toBe(1);
		expect(errors[0]).toEqual(expectedError);
	}

	// .filter(([input]) => input === '[α∈ℬ(R1), β∈ℬ(R1×R2)] α⊆Pr1(β) & card(α)=card(β)')
	correctValuesData.forEach(([input, expectedValue]) => {
		it(`Correct type for "${input}"`, () => expectValue(input, expectedValue));
	});

	errorData.forEach(([input, expectedError]) => {
		it(`Error for "${input as string}"`, () => expectError(input as string, expectedError as RSErrorDescription));
	});
});
