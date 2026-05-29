import type { BasicBinding } from '../../src';

/** Upper bound from axiom A1: `card(X1)≤10`. */
export const A1_MAX_PEOPLE = 10;

export type Gender = 'm' | 'f';

export type GenderRegistry = Record<string, Gender>;

/** Default gender for names in the sample kinship model. */
export const SAMPLE_GENDER: Readonly<Record<string, Gender>> = {
  Иван: 'm',
  Мария: 'f',
  Пётр: 'm',
  Петр: 'm',
  Анна: 'f',
  Олег: 'm',
  Дарья: 'f',
  Семён: 'm'
};

const GENDER_ALIASES: Readonly<Record<string, Gender>> = {
  m: 'm',
  male: 'm',
  man: 'm',
  м: 'm',
  муж: 'm',
  мужчина: 'm',
  f: 'f',
  female: 'f',
  woman: 'f',
  ж: 'f',
  жен: 'f',
  женщина: 'f'
};

/** Parses a gender token (`м`, `ж`, `m`, `f`, …). */
export function parseGenderToken(token: string): Gender | null {
  return GENDER_ALIASES[token.trim().toLowerCase()] ?? null;
}

/** `add <пол> <имя>` — пол первым, имя может содержать пробелы. */
export function parseAddPersonArgs(args: string[]): { gender: Gender; name: string } {
  if (args.length < 2) {
    throw new Error('Укажите пол и имя: add <м|ж> <имя> (например: add м Олег)');
  }
  const gender = parseGenderToken(args[0]);
  if (!gender) {
    throw new Error('Первый аргумент — пол: м, ж, m или f');
  }
  const name = args.slice(1).join(' ').trim();
  assertNonBlankName(name);
  return { gender, name };
}

export function genderLabel(gender: Gender): string {
  return gender === 'm' ? 'м' : 'ж';
}

/** Rebuilds the gender registry from S2/S3 base values and the current X1 binding. */
export function genderByNameFromSets(
  binding: BasicBinding,
  s2: readonly number[],
  s3: readonly number[]
): GenderRegistry {
  const men = new Set(s2);
  const women = new Set(s3);
  const result: GenderRegistry = {};
  for (const { index, name } of bindingEntries(binding)) {
    if (men.has(index)) {
      result[name] = 'm';
    } else if (women.has(index)) {
      result[name] = 'f';
    }
  }
  return result;
}

/** Indices into X1 for S2 (мужчины) and S3 (женщины). */
export function deriveGenderSets(binding: BasicBinding, genderByName: Readonly<GenderRegistry>): {
  s2: number[];
  s3: number[];
} {
  const s2: number[] = [];
  const s3: number[] = [];
  const missing: string[] = [];
  for (const { index, name } of bindingEntries(binding)) {
    const gender = genderByName[name];
    if (gender === 'm') {
      s2.push(index);
    } else if (gender === 'f') {
      s3.push(index);
    } else {
      missing.push(name);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Не задан пол: ${missing.join(', ')}`);
  }
  return { s2, s3 };
}

/** Parent–child tuple: `[TUPLE_ID, parentIndex, childIndex]`. */
export type S1Value = number[][];

export function bindingEntries(binding: BasicBinding): { index: number; name: string }[] {
  return Object.entries(binding)
    .map(([key, name]) => ({ index: Number(key), name }))
    .sort((left, right) => left.index - right.index);
}

export function formatX1(binding: BasicBinding, genderByName?: Readonly<GenderRegistry>): string {
  const entries = bindingEntries(binding);
  if (entries.length === 0) {
    return '(пусто)';
  }
  return entries
    .map(entry => {
      const gender = genderByName?.[entry.name];
      const suffix = gender ? ` (${genderLabel(gender)})` : '';
      return `${entry.index}: ${entry.name}${suffix}`;
    })
    .join('\n');
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

export function addPerson(
  binding: BasicBinding,
  name: string,
  gender: Gender,
  genderByName: GenderRegistry
): BasicBinding {
  assertNonBlankName(name);
  assertUniqueName(binding, name);
  const indices = Object.keys(binding).map(Number);
  const nextIndex = indices.length === 0 ? 0 : Math.max(...indices) + 1;
  const nextBinding = { ...binding, [nextIndex]: name };
  assertA1MaxPeople(nextBinding);
  genderByName[name] = gender;
  return nextBinding;
}

export function renamePerson(
  binding: BasicBinding,
  oldName: string,
  newName: string,
  genderByName: GenderRegistry
): BasicBinding {
  assertNonBlankName(oldName);
  assertNonBlankName(newName);
  const index = assertPersonExists(binding, oldName);
  if (oldName !== newName) {
    assertUniqueName(binding, newName);
    const gender = genderByName[oldName];
    if (gender) {
      delete genderByName[oldName];
      genderByName[newName] = gender;
    }
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

/** Replaces X1; each person is `пол` then `имя` (имя до следующего пола или конца). */
export function setX1WithGender(specs: { gender: Gender; name: string }[]): {
  binding: BasicBinding;
  genderByName: GenderRegistry;
} {
  const genderByName: GenderRegistry = {};
  const binding: BasicBinding = {};
  const seen = new Set<string>();
  for (const { gender, name } of specs) {
    assertNonBlankName(name);
    if (seen.has(name)) {
      throw new Error(`Дубликат имени: «${name}»`);
    }
    seen.add(name);
    binding[Object.keys(binding).length] = name;
    genderByName[name] = gender;
  }
  assertA1MaxPeople(binding);
  return { binding, genderByName };
}

/** Parses `set м Иван ж Мария` or legacy `set Иван Мария` (пол из реестра / SAMPLE_GENDER). */
export function parseSetPersonArgs(
  args: string[],
  existingGenderByName: Readonly<GenderRegistry>
): { specs: { gender: Gender; name: string }[]; legacyNamesOnly: boolean } {
  if (args.length === 0) {
    throw new Error('Укажите людей: set <м|ж> <имя> … или set <имя1> <имя2> …');
  }
  if (parseGenderToken(args[0]) !== null) {
    const specs: { gender: Gender; name: string }[] = [];
    let index = 0;
    while (index < args.length) {
      const gender = parseGenderToken(args[index]);
      if (!gender) {
        throw new Error(`Ожидался пол (м/ж), получено: «${args[index]}»`);
      }
      const nameParts: string[] = [];
      index += 1;
      while (index < args.length && parseGenderToken(args[index]) === null) {
        nameParts.push(args[index]);
        index += 1;
      }
      const name = nameParts.join(' ').trim();
      if (!name) {
        throw new Error(`После пола «${genderLabel(gender)}» укажите имя`);
      }
      specs.push({ gender, name });
    }
    return { specs, legacyNamesOnly: false };
  }
  const legacyNames = args.map(name => name.trim()).filter(Boolean);
  const specs = legacyNames.map(name => {
    const gender = existingGenderByName[name] ?? SAMPLE_GENDER[name];
    if (!gender) {
      throw new Error(
        `Для «${name}» не задан пол. Используйте: set <м|ж> <имя> … (например: set м ${name})`
      );
    }
    return { gender, name };
  });
  return { specs, legacyNamesOnly: true };
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
  name: string,
  genderByName: GenderRegistry
): { binding: BasicBinding; s1: S1Value } {
  const removedIndex = assertPersonExists(binding, name);
  delete genderByName[name];
  return {
    binding: reindexBindingAfterRemove(binding, removedIndex),
    s1: remapS1AfterRemove(s1, removedIndex)
  };
}
