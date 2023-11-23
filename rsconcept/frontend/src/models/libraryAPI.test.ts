import { ILibraryItem, LibraryItemType } from './library';
import { matchLibraryItem } from './libraryAPI';


describe('Testing matching LibraryItem', () => {
  const item1: ILibraryItem = {
    id: 42,
    item_type: LibraryItemType.RSFORM,
    title: 'Item1',
    alias: 'I1',
    comment: 'comment',
    is_common: true,
    is_canonical: true,
    time_create: 'I2',
    time_update: '',
    owner: null
  };

  const itemEmpty: ILibraryItem = {
    id: -1,
    item_type: LibraryItemType.RSFORM,
    title: '',
    alias: '',
    comment: '',
    is_common: true,
    is_canonical: true,
    time_create: '',
    time_update: '',
    owner: null
  };

  test('empty input',
  () => {
    expect(matchLibraryItem(itemEmpty, '')).toEqual(true);
    expect(matchLibraryItem(itemEmpty, '12')).toEqual(false);
    expect(matchLibraryItem(itemEmpty, ' ')).toEqual(false);
  });

  test('regular input',
  () => {
    expect(matchLibraryItem(item1, item1.title)).toEqual(true);
    expect(matchLibraryItem(item1, item1.alias)).toEqual(true);
    expect(matchLibraryItem(item1, item1.title + '@invalid')).toEqual(false);
    expect(matchLibraryItem(item1, item1.alias + '@invalid')).toEqual(false);
    expect(matchLibraryItem(item1, item1.time_create)).toEqual(false);
    expect(matchLibraryItem(item1, item1.comment)).toEqual(false);
  });
});
