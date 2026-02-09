/* 
 * Module: Typification for RSLang.
 */


/** Typification structure enumeration. */
export const TypeID = {
  anyTypification: 1,
  integer: 2,
  basic: 3,
  tuple: 4,
  collection: 5,
  logic: 6,
  function: 7,
  predicate: 8
} as const;
export type TypeID = (typeof TypeID)[keyof typeof TypeID];

/** Represents type class. */
export const TypeClass = {
  logic: 1,
  typification: 2,
  function: 3,
  predicate: 4
} as const;
export type TypeClass = (typeof TypeClass)[keyof typeof TypeClass];

/** Logic type object. */
export const LogicT = { typeID: TypeID.logic } as const;

/** Integer type object. */
export const IntegerT = {
  typeID: TypeID.integer,
  isOrdered: true,
  isArithmetic: true,
  isIntegerCompatible: true
} as const;

/** AnyTyped type object. */
export const AnyTypificationT = { typeID: TypeID.anyTypification } as const;

/** Empty set typification. */
export const EmptySetT = bool(AnyTypificationT);

/** Parametrized typification. */
export type Parametrized = EchelonFunctional | EchelonPredicate;

/** General expression types. */
export type ExpressionType =
  EchelonLogic | EchelonBase |
  EchelonTuple | EchelonCollection |
  EchelonFunctional | EchelonPredicate |
  EchelonAnyTyped | EchelonInteger;

/** Setexpr type. */
export type Typification = EchelonBase | EchelonAnyTyped | EchelonInteger | EchelonCollection | EchelonTuple;

/** Typification context. */
export type TypeContext = Map<string, ExpressionType>;

/** Functional argument. */
export interface Argument {
  readonly alias: string;
  readonly type: Typification;
}

/** Type: Logic. */
export interface EchelonLogic {
  readonly typeID: typeof TypeID.logic;
}

/** Type: AnyTyped. */
export interface EchelonAnyTyped {
  readonly typeID: typeof TypeID.anyTypification;
}

/** Type: Integer. */
export interface EchelonInteger {
  readonly typeID: typeof TypeID.integer;
  readonly isOrdered: true;
  readonly isArithmetic: true;
  readonly isIntegerCompatible: true;
}

/** Type: Element of basic set. */
export interface EchelonBase {
  readonly typeID: typeof TypeID.basic;
  readonly baseID: string;
  readonly isOrdered?: boolean;
  readonly isArithmetic?: boolean;
  readonly isIntegerCompatible?: boolean;
}

/** Type: Tuple. */
export interface EchelonTuple {
  readonly typeID: typeof TypeID.tuple;
  readonly factors: readonly Typification[];
}

/** Type: Collection. */
export interface EchelonCollection {
  readonly typeID: typeof TypeID.collection;
  readonly base: Typification;
}

/** Type: Functional. */
export interface EchelonFunctional {
  readonly typeID: typeof TypeID.function;
  readonly result: Typification;
  readonly args: readonly Argument[];
}

/** Type: Predicate. */
export interface EchelonPredicate {
  readonly typeID: typeof TypeID.predicate;
  readonly result: EchelonLogic;
  readonly args: readonly Argument[];
}

/** Create basic element typification. */
export function basic(alias: string): EchelonBase {
  return { typeID: TypeID.basic, baseID: alias };
}

/** Create constant element typification. */
export function constant(alias: string): EchelonBase {
  return { typeID: TypeID.basic, baseID: alias, isOrdered: true, isArithmetic: true, isIntegerCompatible: true };
}

/** Create boolean typification. */
export function bool(base: Typification): EchelonCollection {
  return { typeID: TypeID.collection, base };
}

/** Create tuple typification. */
export function tuple(factors: Typification[]): EchelonTuple {
  if (factors.length < 2) {
    throw new Error('Tuple with less than two factors is not allowed');
  }
  return { typeID: TypeID.tuple, factors };
}

/** Remove boolean from typification. */
export function debool(target: EchelonCollection): Typification {
  return target.base;
}

/** Extract component from tuple. */
export function component(target: EchelonTuple, index: number): Typification {
  return target.factors[index - 1];
}

/** Checks if given type is typification. */
export function isTypification(type: ExpressionType): boolean {
  return (
    type.typeID === TypeID.basic ||
    type.typeID === TypeID.anyTypification ||
    type.typeID === TypeID.integer ||
    type.typeID === TypeID.collection ||
    type.typeID === TypeID.tuple
  );
}

/** Checks if given type is radical. */
export function isRadical(alias: string): boolean {
  return alias.length > 0 && alias.startsWith('R') && alias[1] !== '0';
}
