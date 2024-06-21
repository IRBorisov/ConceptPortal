import { FolderTree } from './FolderTree';

// TODO: test FolderNode and FolderTree exhaustively

describe('Testing Tree construction', () => {
  test('empty Tree should be empty', () => {
    const tree = new FolderTree();
    expect(tree.roots.size).toBe(0);
  });

  test('constructing from paths', () => {
    const tree = new FolderTree(['/S', '/S/project1/123', '/U']);
    expect(tree.roots.size).toBe(2);
    expect(tree.roots.get('S')?.children.size).toBe(1);
  });
});

describe('Testing Tree editing', () => {
  test('add invalid path', () => {
    const tree = new FolderTree();
    expect(() => tree.addPath('invalid')).toThrow(Error);
  });

  test('add valid path', () => {
    const tree = new FolderTree();
    const node = tree.addPath('/S/test');
    expect(node.getPath()).toBe('/S/test');
    expect(node.filesInside).toBe(1);
    expect(node.filesTotal).toBe(1);

    expect(node.parent?.getPath()).toBe('/S');
    expect(node.parent?.filesInside).toBe(0);
    expect(node.parent?.filesTotal).toBe(1);
  });

  test('incrementing counter', () => {
    const tree = new FolderTree();
    const node1 = tree.addPath('/S/test', 0);
    expect(node1.filesInside).toBe(0);
    expect(node1.filesTotal).toBe(0);

    const node2 = tree.addPath('/S/test', 2);
    expect(node1).toBe(node2);
    expect(node2.filesInside).toBe(2);
    expect(node2.filesTotal).toBe(2);
  });
});
