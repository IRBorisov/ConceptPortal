const PREFIX = {
  basic: 'X',
  constant: 'C',
  structure: 'S',
  term: 'D',
  axiom: 'A',
  function: 'F',
  predicate: 'P',
  theorem: 'T',
  statement: 'T',
  nominal: 'N'
};
const CORE = new Set(['basic', 'constant', 'structure']);
const CALLABLE = new Set(['function', 'predicate']);
const BASE_SET = new Set(['basic', 'constant']);

function freeName(stem, used) {
  if (!used.has(stem)) return stem;
  let suffix = 1;
  while (used.has(stem + suffix)) suffix += 1;
  return stem + suffix;
}

function freshNames(locals) {
  return { context: freeName('c', locals), value: freeName('v', locals), graph: 'g' };
}

function relink(expression, aliases) {
  return expression.replace(/[XCSADFPTN]\d+/g, alias => aliases.get(alias) ?? alias);
}

function relinkText(text, aliases) {
  return text.replace(/(@\{)([XCSADFPTN]\d+)(?=[|}])/g, (_, start, alias) => start + (aliases.get(alias) ?? alias));
}

function allocateAliases(items, additions, hasAccessor) {
  const counts = new Map();
  const output = new Map();
  const generated = new Map();
  const allocate = kind => {
    const prefix = PREFIX[kind];
    const index = (counts.get(prefix) ?? 0) + 1;
    counts.set(prefix, index);
    return prefix + index;
  };
  for (const item of items) output.set(item.alias, allocate(item.cstType));
  for (const item of additions) generated.set(item.alias, allocate('structure'));
  return { output, generated, accessor: hasAccessor ? allocate('function') : null };
}

function walk(ast, visit) {
  if (!ast) return;
  const stack = [ast];
  while (stack.length) {
    const node = stack.pop();
    visit(node);
    for (let index = node.children.length - 1; index >= 0; --index) {
      stack.push(node.children[index]);
    }
  }
}

function applyEdits(expression, edits) {
  const chunks = [];
  let position = 0;
  for (const { from, to, text } of edits) {
    chunks.push(expression.slice(position, from), text);
    position = to;
  }
  chunks.push(expression.slice(position));
  return chunks.join('');
}

function remapRecord(item, alias, formal, aliases, origin, role, entityUID = item.entityUID) {
  const { parse, ...record } = item;
  const term = item.term;
  const text = item.definition.text;
  return {
    ...record,
    entityUID,
    alias,
    origin,
    role,
    term: term && { ...term, raw: relinkText(term.raw ?? '', aliases) },
    definition: {
      ...item.definition,
      formal,
      ...(item.definition.typification_manual !== undefined
        ? { typification_manual: relink(item.definition.typification_manual, aliases) }
        : {}),
      text: text && { ...text, raw: relinkText(text.raw ?? '', aliases) }
    }
  };
}

/** Build the pure transformation with the Portal's RSLang runtime. */
export function createRelativizer({
  RSLangAnalyzer,
  TokenID,
  TypeID,
  labelType,
  parseRSLangExpression,
  extractGlobals
}) {
  const binaryLogic = new Set([
    TokenID.LOGIC_AND,
    TokenID.LOGIC_OR,
    TokenID.LOGIC_IMPLICATION,
    TokenID.LOGIC_EQUIVALENT
  ]);
  const globalTokens = new Set([TokenID.ID_GLOBAL, TokenID.ID_FUNCTION, TokenID.ID_PREDICATE]);

  /** Index references and analyze the input once for repeated choices on the same schema. */
  function prepare(items) {
    const byAlias = new Map(items.map(item => [item.alias, item]));
    if (byAlias.size !== items.length) throw new Error('Duplicate source aliases');
    const analyzer = new RSLangAnalyzer();
    const children = new Map(items.map(item => [item.alias, []]));
    const indegree = new Map();
    const asts = new Map();
    const locals = new Map();
    const diagnostics = new Map();
    const typed = new Set();
    const queue = [];
    for (const item of items) {
      const { alias, cstType: kind } = item;
      const expression = item.definition.formal;
      if (BASE_SET.has(kind)) analyzer.addBase(alias, kind === 'constant');
      const ast = parseRSLangExpression(expression);
      asts.set(alias, ast);
      const names = new Set();
      walk(ast, node => {
        if (node.typeID === TokenID.ID_LOCAL) names.add(expression.slice(node.from, node.to));
      });
      locals.set(alias, names);
      let count = 0;
      for (const dep of extractGlobals(expression)) {
        if (!byAlias.has(dep)) continue;
        children.get(dep).push(alias);
        count += 1;
      }
      indegree.set(alias, count);
      if (count === 0) queue.push(alias);
    }
    for (let index = 0; index < queue.length; ++index) {
      const alias = queue[index];
      const item = byAlias.get(alias);
      const kind = item.cstType;
      if (BASE_SET.has(kind)) {
        typed.add(alias);
      } else {
        const result = analyzer.checkFull(item.definition.formal, { isDomain: kind === 'structure' });
        if (result.success) {
          typed.add(alias);
          analyzer.setGlobal(alias, result.type, result.valueClass);
        } else if (item.definition.formal.trim()) {
          diagnostics.set(alias, result.errors);
        }
      }
      for (const next of children.get(alias)) {
        const count = indegree.get(next) - 1;
        indegree.set(next, count);
        if (count === 0) queue.push(next);
      }
    }
    return { items, byAlias, asts, locals, children, typed, analyzer, diagnostics };
  }

  function rewrite(expression, ast, state) {
    const edits = [];
    walk(ast, node => {
      if (node.typeID === TokenID.NT_FUNC_CALL) {
        const [head, firstArgument] = node.children;
        const alias = expression.slice(head.from, head.to);
        if (firstArgument && state.affected.has(alias)) {
          // Visit the name first, then insert before the first argument.
          edits.push({ from: head.from, to: head.to, text: state.references.get(alias) });
          edits.push({ from: firstArgument.from, to: firstArgument.from, text: state.context + ', ' });
        }
        return;
      }
      if (!globalTokens.has(node.typeID)) return;
      if (node.parent?.typeID === TokenID.NT_FUNC_CALL && node.parent.children[0] === node) {
        const head = expression.slice(node.from, node.to);
        if (state.affected.has(head) && node.parent.children.length > 1) return;
      }
      const alias = expression.slice(node.from, node.to);
      const name = state.references.get(alias);
      let text = name;
      if (alias === state.target) {
        text = state.context;
      } else if (state.slices.has(alias)) {
        state.usesAccessor = true;
        text = state.accessor + '[' + state.context + ', ' + name + ']';
      }
      if (text && text !== alias) edits.push({ from: node.from, to: node.to, text });
    });
    return applyEdits(expression, edits);
  }

  function transform(prepared, params) {
    const { items, byAlias, asts, children, typed, analyzer } = prepared;
    const { target } = params;
    const ignored = new Set(params.ignored ?? []);
    const targetItem = byAlias.get(target);
    if (
      !targetItem ||
      !['basic', 'structure'].includes(targetItem.cstType) ||
      !typed.has(target) ||
      ignored.has(target) ||
      [...ignored].some(alias => !byAlias.has(alias))
    )
      return null;

    const seeds = items.filter(item => CORE.has(item.cstType) && !ignored.has(item.alias));
    const additions = seeds.filter(item => BASE_SET.has(item.cstType) && item.alias !== target);
    if (targetItem.cstType === 'basic') additions.unshift(targetItem);
    const reachable = new Set(seeds.map(item => item.alias));
    const queue = [...reachable];
    for (let position = 0; position < queue.length; ++position) {
      for (const next of children.get(queue[position])) {
        if (!reachable.has(next)) {
          reachable.add(next);
          queue.push(next);
        }
      }
    }
    const affected = new Set();
    const slices = new Set();
    const used = new Set();
    for (const alias of reachable) {
      if (alias === target || ignored.has(alias) || !typed.has(alias)) continue;
      affected.add(alias);
      const { cstType } = byAlias.get(alias);
      if (CORE.has(cstType) || cstType === 'term') slices.add(alias);
      for (const local of prepared.locals.get(alias)) used.add(local);
    }
    const { context, value, graph } = freshNames(used);
    const { output, generated, accessor } = allocateAliases(items, additions, slices.size > 0);
    const references = new Map([...output, ...generated]);
    const axis = references.get(target);
    const contextTypification = analyzer.getType(target);
    const contextType = relink(labelType(contextTypification), output);
    const contextFactor = contextTypification.typeID === TypeID.tuple ? '(' + contextType + ')' : contextType;
    const axisDefinition = 'ℬ' + contextFactor;
    const result = [];
    const ids = new Set(items.map(item => item.entityUID));
    let nextId = 1;
    function newId() {
      while (ids.has(nextId)) nextId += 1;
      const id = nextId;
      nextId += 1;
      return id;
    }
    const state = { target, affected, slices, references, accessor, context, usesAccessor: false };
    // Keep the source slice type where projection changes a domain reference.
    const changedTypes = new Set([target, ...generated.keys()]);
    for (const alias of affected) {
      if (byAlias.get(alias).cstType === 'structure') changedTypes.add(alias);
    }
    function stableDomain(alias, expression) {
      if ([...extractGlobals(expression)].some(name => changedTypes.has(name)) && typed.has(alias)) {
        const type = analyzer.getType(alias);
        const domain = relink(labelType(type), output);
        return type.typeID === TypeID.tuple ? '(' + domain + ')' : domain;
      }
      return relink(expression, output);
    }
    let lastKernelIndex = -1;
    for (const item of items) {
      const { alias, cstType: kind } = item;
      const expression = item.definition.formal;
      const ast = asts.get(alias);
      let formal;
      if (alias === target && kind === 'structure') {
        formal = axisDefinition;
      } else if (kind === 'structure' && affected.has(alias)) {
        formal = 'ℬ(' + axis + '×' + stableDomain(alias, expression) + ')';
      } else if (kind === 'structure') {
        formal = stableDomain(alias, expression);
      } else if (!affected.has(alias) || BASE_SET.has(kind)) {
        formal = relink(expression, references);
      } else {
        const rewritten = rewrite(expression, ast, state);
        if (CALLABLE.has(kind)) {
          const start = rewritten.indexOf('[') + 1;
          formal = rewritten.slice(0, start) + context + '∈' + axis + ', ' + rewritten.slice(start);
        } else if (kind === 'axiom' || kind === 'theorem' || kind === 'statement') {
          const predicate = binaryLogic.has(ast.typeID) ? '(' + rewritten + ')' : rewritten;
          formal = '∀' + context + '∈' + axis + ' ' + predicate;
        } else {
          formal =
            'I{(' + context + ', ' + value + ') | ' + context + ':∈' + axis + '; ' + value + ':=' + rewritten + '}';
        }
      }
      const role = generated.has(alias) ? 'carrier' : alias === target ? 'axis' : 'constituent';
      result.push(remapRecord(item, output.get(alias), formal, references, item.entityUID, role));
      if (CORE.has(kind)) lastKernelIndex = result.length - 1;
    }

    const added = additions.map(item => {
      const alias = item.alias;
      const formal = alias === target ? axisDefinition : 'ℬ(' + axis + '×ℬ(' + output.get(alias) + '))';
      return remapRecord(
        { ...item, cstType: 'structure' },
        generated.get(alias),
        formal,
        references,
        item.entityUID,
        alias === target ? 'axis' : 'relation',
        newId()
      );
    });
    const ordered = [...result.slice(0, lastKernelIndex + 1), ...added, ...result.slice(lastKernelIndex + 1)];
    if (state.usesAccessor) {
      const term = 'Дерелятивизация по контексту';
      ordered.push({
        entityUID: newId(),
        type: 'constituenta',
        cstType: 'function',
        alias: accessor,
        convention:
          'Извлечение единственного значения, сопоставленного заданному контексту в релятивизированном отношении.',
        origin: null,
        role: 'accessor',
        term: { raw: term, resolved: term, forms: [] },
        definition: {
          formal:
            '[' +
            context +
            '∈' +
            axis +
            ', ' +
            graph +
            '∈ℬ(' +
            axis +
            '×R1)] debool(Pr2(Fi1[{' +
            context +
            '}](' +
            graph +
            ')))',
          text: { raw: '', resolved: '' }
        }
      });
    }
    return { title: params.title, alias: params.alias, items: ordered, names: { context, value, graph } };
  }
  return { prepare, transform };
}
