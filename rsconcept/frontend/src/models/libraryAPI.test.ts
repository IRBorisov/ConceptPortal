import { AccessPolicy, ILibraryItem, LibraryItemType, LocationHead } from './library';
import { matchLibraryItem, validateLocation } from './libraryAPI';

describe('Testing matching LibraryItem', () => {
  const item1: ILibraryItem = {
    id: 42,
    item_type: LibraryItemType.RSFORM,
    title: 'Item1',
    alias: 'I1',
    comment: 'comment',
    time_create: 'I2',
    time_update: '',
    owner: null,
    access_policy: AccessPolicy.PUBLIC,
    location: LocationHead.COMMON,
    read_only: false,
    visible: true
  };

  const itemEmpty: ILibraryItem = {
    id: -1,
    item_type: LibraryItemType.RSFORM,
    title: '',
    alias: '',
    comment: '',
    time_create: '',
    time_update: '',
    owner: null,
    access_policy: AccessPolicy.PUBLIC,
    location: LocationHead.COMMON,
    read_only: false,
    visible: true
  };

  test('empty input', () => {
    expect(matchLibraryItem(itemEmpty, '')).toEqual(true);
    expect(matchLibraryItem(itemEmpty, '12')).toEqual(false);
    expect(matchLibraryItem(itemEmpty, ' ')).toEqual(false);
  });

  test('regular input', () => {
    expect(matchLibraryItem(item1, item1.title)).toEqual(true);
    expect(matchLibraryItem(item1, item1.alias)).toEqual(true);
    expect(matchLibraryItem(item1, item1.title + '@invalid')).toEqual(false);
    expect(matchLibraryItem(item1, item1.alias + '@invalid')).toEqual(false);
    expect(matchLibraryItem(item1, item1.time_create)).toEqual(false);
    expect(matchLibraryItem(item1, item1.comment)).toEqual(false);
  });
});

const validateLocationData = [
  ['', 'false'],
  ['U/U', 'false'],
  ['/A', 'false'],
  ['/U/user@mail', 'false'],
  ['U/u\\asdf', 'false'],
  ['/U/ asdf', 'false'],
  ['/User', 'false'],
  ['//', 'false'],
  ['/S/1 ', 'false'],
  ['/S/1/2 /3', 'false'],

  ['/P', 'true'],
  ['/L', 'true'],
  ['/U', 'true'],
  ['/S', 'true'],
  ['/S/Вася пупки', 'true'],
  ['/S/123', 'true'],
  ['/S/1234', 'true'],
  ['/S/1/!asdf/тест тест', 'true']
];
describe('Testing location validation', () => {
  it.each(validateLocationData)('isValid %p', (input: string, expected: string) => {
    const result = validateLocation(input);
    expect(String(result)).toBe(expected);
  });
});
