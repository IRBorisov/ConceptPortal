import type { BasicBinding } from '../../src';

/** Upper bound from axiom A1: `card(X1)≤10`. */
export const A1_MAX_PEOPLE = 10;

/** Parent–child tuple: `[TUPLE_ID, parentIndex, childIndex]`. */
export type S1Value = number[][];

export function bindingEntries(binding: BasicBinding): { index: number; name: string }[] {
  return Object.entries(binding)
    .map(([key, name]) => ({ index: Number(key), name }))
    .sort((left, right) => left.index - right.index);
}

export function formatX1(binding: BasicBinding): string {
  const entries = bindingEntries(binding);
  if (entries.length === 0) {
    return '(пусто)';
  }
  return entries.map(entry => `${entry.index}: ${entry.name}`).join('\n');
}

export function formatS1(binding: BasicBinding, s1: S1Value): string {
  if (s1.length === 0) {
    return '(пусто)';
  }
  return s1
    .map(tuple => {
      const parent = binding[tuple[1]] ?? `#${tuple[1]}`;
      const child = binding[tuple[2]] ?? `#${tuple[2]}`;
      return `${parent} → ${child}`;
    })
    .join('\n');
}

export function findIndexByName(binding: BasicBinding, name: string): number | null {
  for (const [key, value] of Object.entries(binding)) {
    if (value === name) {
      return Number(key);
    }
  }
  return null;
}

export function listNames(binding: BasicBinding): string[] {
  return bindingEntries(binding).map(entry => entry.name);
}

/** `card(X1)` for the current binding. */
export function x1Cardinality(binding: BasicBinding): number {
  return bindingEntries(binding).length;
}

/** Whether binding satisfies A1 (`card(X1)≤10`). */
export function satisfiesA1MaxPeople(binding: BasicBinding, maxPeople = A1_MAX_PEOPLE): boolean {
  return x1Cardinality(binding) <= maxPeople;
}

export function formatA1Status(binding: BasicBinding, maxPeople = A1_MAX_PEOPLE): string {
  const count = x1Cardinality(binding);
  const holds = count <= maxPeople;
  return `A1 card(X1)≤${maxPeople}: ${holds ? 'выполняется' : 'нарушена'} (${count} чел.)`;
}

function assertA1MaxPeople(binding: BasicBinding): void {
  const count = x1Cardinality(binding);
  if (count > A1_MAX_PEOPLE) {
    throw new Error(
      `Аксиома A1 «card(X1)≤${A1_MAX_PEOPLE}» нарушена: ${count} человек (максимум ${A1_MAX_PEOPLE})`
    );
  }
}

function assertUniqueName(binding: BasicBinding, name: string): void {
  if (findIndexByName(binding, name) !== null) {
    throw new Error(`Человек «${name}» уже есть в X1`);
  }
}

function assertPersonExists(binding: BasicBinding, name: string): number {
  const index = findIndexByName(binding, name);
  if (index === null) {
    throw new Error(`Человек «${name}» не найден в X1 (доступны: ${listNames(binding).join(', ') || '—'})`);
  }
  return index;
}

function assertNonBlankName(name: string): void {
  if (!name.trim()) {
    throw new Error('Имя не может быть пустым');
  }
}

export function addPerson(binding: BasicBinding, name: string): BasicBinding {
  assertNonBlankName(name);
  assertUniqueName(binding, name);
  const indices = Object.keys(binding).map(Number);
  const nextIndex = indices.length === 0 ? 0 : Math.max(...indices) + 1;
  const nextBinding = { ...binding, [nextIndex]: name };
  assertA1MaxPeople(nextBinding);
  return nextBinding;
}

export function renamePerson(binding: BasicBinding, oldName: string, newName: string): BasicBinding {
  assertNonBlankName(oldName);
  assertNonBlankName(newName);
  const index = assertPersonExists(binding, oldName);
  if (oldName !== newName) {
    assertUniqueName(binding, newName);
  }
  return { ...binding, [index]: newName };
}

export function setX1List(names: string[]): BasicBinding {
  const seen = new Set<string>();
  const binding: BasicBinding = {};
  for (const name of names) {
    assertNonBlankName(name);
    if (seen.has(name)) {
      throw new Error(`Дубликат имени: «${name}»`);
    }
    seen.add(name);
    binding[Object.keys(binding).length] = name;
  }
  assertA1MaxPeople(binding);
  return binding;
}

export function clearX1Binding(): BasicBinding {
  return {};
}

function reindexBindingAfterRemove(binding: BasicBinding, removedIndex: number): BasicBinding {
  const result: BasicBinding = {};
  for (const [key, name] of Object.entries(binding)) {
    const index = Number(key);
    if (index === removedIndex) {
      continue;
    }
    result[index > removedIndex ? index - 1 : index] = name;
  }
  return result;
}

export function remapS1AfterRemove(s1: S1Value, removedIndex: number): S1Value {
  return s1
    .filter(tuple => tuple[1] !== removedIndex && tuple[2] !== removedIndex)
    .map(tuple => [
      tuple[0],
      tuple[1] > removedIndex ? tuple[1] - 1 : tuple[1],
      tuple[2] > removedIndex ? tuple[2] - 1 : tuple[2]
    ]);
}

export function remapS1ByNames(oldBinding: BasicBinding, newBinding: BasicBinding, s1: S1Value): S1Value {
  const newIndexByName = new Map(bindingEntries(newBinding).map(entry => [entry.name, entry.index]));
  const result: S1Value = [];

  for (const tuple of s1) {
    const parentName = oldBinding[tuple[1]];
    const childName = oldBinding[tuple[2]];
    if (!parentName || !childName) {
      continue;
    }
    const parentIndex = newIndexByName.get(parentName);
    const childIndex = newIndexByName.get(childName);
    if (parentIndex === undefined || childIndex === undefined) {
      continue;
    }
    result.push([tuple[0], parentIndex, childIndex]);
  }

  return result;
}

export function removePerson(
  binding: BasicBinding,
  s1: S1Value,
  name: string
): { binding: BasicBinding; s1: S1Value } {
  const removedIndex = assertPersonExists(binding, name);
  return {
    binding: reindexBindingAfterRemove(binding, removedIndex),
    s1: remapS1AfterRemove(s1, removedIndex)
  };
}
