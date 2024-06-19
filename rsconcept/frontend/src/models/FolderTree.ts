/**
 * Module: Folder tree data structure. Does not support deletions.
 */

/**
 * Represents single node of a {@link FolderTree}.
 */
export class FolderNode {
  rank: number = 0;
  text: string;
  children: Map<string, FolderNode>;
  parent: FolderNode | undefined;

  filesInside: number = 0;
  filesTotal: number = 0;

  constructor(text: string, parent?: FolderNode) {
    this.text = text;
    this.parent = parent;
    this.children = new Map();
    if (parent) {
      this.rank = parent.rank + 1;
    }
  }

  addChild(text: string): FolderNode {
    const node = new FolderNode(text, this);
    this.children.set(text, node);
    return node;
  }

  hasPredecessor(target: FolderNode): boolean {
    if (this.parent === target) {
      return true;
    } else if (!this.parent) {
      return false;
    }
    let node = this.parent;
    while (node.parent) {
      if (node.parent === target) {
        return true;
      }
      node = node.parent;
    }
    return false;
  }

  incrementFiles(count: number = 1): void {
    this.filesInside = this.filesInside + count;
    this.incrementTotal(count);
  }

  incrementTotal(count: number = 1): void {
    this.filesTotal = this.filesTotal + count;
    if (this.parent) {
      this.parent.incrementTotal(count);
    }
  }

  getPath(): string {
    const suffix = this.text ? `/${this.text}` : '';
    if (!this.parent) {
      return suffix;
    } else {
      return this.parent.getPath() + suffix;
    }
  }
}

/**
 * Represents a FolderTree.
 *
 */
export class FolderTree {
  roots: Map<string, FolderNode> = new Map();

  constructor(arr?: string[]) {
    arr?.forEach(path => this.addPath(path));
  }

  at(path: string): FolderNode | undefined {
    let parse = ChopPathHead(path);
    if (!this.roots.has(parse.head)) {
      return undefined;
    }
    let node = this.roots.get(parse.head)!;
    while (parse.tail !== '') {
      parse = ChopPathHead(parse.tail);
      if (!node.children.has(parse.head)) {
        return undefined;
      }
      node = node.children.get(parse.head)!;
    }
    return node;
  }

  getTree(): FolderNode[] {
    const result: FolderNode[] = [];
    this.roots.forEach(root => this.visitNode(root, result));
    return result;
  }

  private visitNode(target: FolderNode, result: FolderNode[]) {
    result.push(target);
    target.children.forEach(child => this.visitNode(child, result));
  }

  addPath(path: string, filesCount: number = 1): FolderNode {
    let parse = ChopPathHead(path);
    if (!parse.head) {
      throw Error(`Invalid path ${path}`);
    }
    let node = this.roots.has(parse.head) ? this.roots.get(parse.head)! : this.addNode(parse.head);
    while (parse.tail !== '') {
      parse = ChopPathHead(parse.tail);
      if (node.children.has(parse.head)) {
        node = node.children.get(parse.head)!;
      } else {
        node = this.addNode(parse.head, node);
      }
    }
    node.incrementFiles(filesCount);
    return node;
  }

  private addNode(text: string, parent?: FolderNode): FolderNode {
    if (parent === undefined) {
      const newNode = new FolderNode(text);
      this.roots.set(text, newNode);
      return newNode;
    } else {
      return parent.addChild(text);
    }
  }
}

// ========= Internals =======
function ChopPathHead(path: string) {
  if (!path || path.at(0) !== '/') {
    return {
      head: '',
      tail: ''
    };
  }
  const slash = path.indexOf('/', 1);
  if (slash === -1) {
    return {
      head: path.substring(1),
      tail: ''
    };
  } else {
    return {
      head: path.substring(1, slash),
      tail: path.substring(slash)
    };
  }
}
