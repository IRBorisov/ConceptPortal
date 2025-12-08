const IGNORE_PROPS = [
  'animation',
  'text-size-adjust',
  'text-decoration',
  'interpolate-size',
  'interest-delay',
  'text-emphasis',
  'font-synthesis',
  'caret-color',
  'transition',
  'transition-origin',
  'list-style',
  'perspective-origin',
  'pointer-events',
  'animation-composition',
  'border-collapse',
  'dynamic-range-limit',
  'flood-color',
  'initial-letter',
  'ruby-align',
  'ruby-position',
  'stop-opacity',
  'stop-color',
  'ruby-position',
  'print-color-adjust',
  'backface-visibility',
  'box-decoration-break',
  'caption-side',
  'math-depth',
  'object-fit',
  'order',
  'orphans',
  'position-visibility',
  'shape-image-threshold',
  'reading-order',
  'transform-style',
  'unicode-bidi',
  'writing-mode',
  'white-space-collapse',
  'widows',
  'lighting-color',
  'direction',
  'column-rule',
  'color-interpolation-filters',
  'flood-opacity',
  'color-interpolation',
  'empty-cells',
  'overflow-inline',
  'overflow-block'
];
const ALLOW_NONE: string[] = [];
const ALLOW_AUTO: string[] = [];
const ALLOW_0PX: string[] = [];
const ALLOW_NORMAL: string[] = [];

const DEFAULT_DECLS = [
  'offset: normal',
  'overflow: hidden',
  'text-wrap: wrap',
  'border-image: none 100% / 1 / 0 stretch',
  'flex-flow: row',
  'outline: oklch(0 0 0) none 0px',
  'place-content: normal',
  'place-items: normal',
  'background: none 0% 0% / auto repeat scroll padding-box border-box rgba(0, 0, 0, 0)',
  'border-block-end: 0px solid oklch(0.85 0 0)',
  'border-block-start: 0px solid oklch(0.85 0 0)',
  'border-color: oklch(0.85 0 0)',
  'border-style: solid',
  'border-inline-end: 0px solid oklch(0.85 0 0)',
  'border-inline-start: 0px solid oklch(0.85 0 0)',
  'background-blend-mode: normal',
  'clip-rule: nonzero',
  'content: normal',
  'font-palette: normal',
  'image-orientation: from-image',
  'mask-type: luminance',
  'font-stretch: 100%',
  'hyphens: manual',
  'vertical-align: baseline',
  'visibility: visible',
  'zoom: 1',
  'corner-block-end-shape: round',
  'corner-block-start-shape: round',
  'corner-shape: round',
  'object-position: 50% 50%',
  'opacity: 1',
  'stroke-linecap: butt',
  'stroke-linejoin: miter',
  'stroke-miterlimit: 4',
  'stroke-opacity: 1',
  'stroke-width: 1px',
  'tab-size: 4',
  'text-align: start',
  'text-anchor: start',
  'text-autospace: no-autospace',
  'text-emphasis-position: over',
  'text-overflow: clip',
  'fill-opacity: 1',
  'fill-rule: nonzero',
  'field-sizing: fixed',
  'display: block',
  'overflow-clip-margin: content-box',
  'flex: 0 1 auto'
];

const ROOT_DECLS = [
  'accent-color: oklch(0.6 0.23 262)',
  'block-size: 889px',
  'color: oklch(0 0 0)',
  'fill: rgb(0, 0, 0)',
  'line-height: 24px'
];

const REMOVE_ATTRIBUTES = [
  'aria-roledescription',
  'aria-label',
  'data-message',
  'data-id',
  'data-testid',
  'data-tooltip-html',
  'data-tooltip-id',
  'aria-describedby'
];

const REMOVE_IDS = [
  'react-flow__node-desc-react-flow-container',
  'react-flow__edge-desc-react-flow-container',
  'react-flow__aria-live-react-flow-container'
];

/** Cleans SVG string from useless elements. */
export function cleanSvg(svgText: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');

  doc.querySelectorAll('[class]').forEach(el => el.removeAttribute('class'));
  REMOVE_ATTRIBUTES.forEach(attr => doc.querySelectorAll(`[${attr}]`).forEach(el => el.removeAttribute(attr)));
  REMOVE_IDS.forEach(id => {
    const el = doc.getElementById(id);
    if (el) {
      el.remove();
    }
  });

  const reactFlowLink = doc.querySelector('a[href="https://reactflow.dev"]');
  if (reactFlowLink?.parentElement) {
    reactFlowLink.parentElement.remove();
  }

  const usedVars = new Set<string>();
  doc.querySelectorAll('[style]').forEach(el => {
    const style = el.getAttribute('style') ?? '';
    const matches = style.match(/var\(--[^)]+\)/g);
    if (matches) {
      matches.forEach(m => {
        usedVars.add(m.slice(4, -1).trim()); // extract --var-name
      });
    }
  });

  doc.querySelectorAll('[style]').forEach(style => cleanStyle(style, usedVars));

  doc.querySelectorAll('*').forEach(el => {
    if (isInvisible(el)) {
      el.remove();
    }
  });

  return new XMLSerializer().serializeToString(doc);
}

/** Remove invisible shapes */
function isInvisible(el: Element): boolean {
  const ariaHidden = el.getAttribute('aria-hidden');
  if (ariaHidden === 'true' && el.tagName !== 'svg') return true;

  const style = el.getAttribute('style') ?? '';

  // Invisible by opacity
  if (style.includes('opacity: 0')) return true;

  // fill:none + stroke:none
  const noFill = style.includes('fill: none');
  const noStroke = style.includes('stroke: none');
  if (noFill && noStroke) return true;

  // Zero-area shapes:
  switch (el.tagName.toLowerCase()) {
    case 'rect':
      return el.getAttribute('width') === '0' || el.getAttribute('height') === '0';

    case 'circle':
      return el.getAttribute('r') === '0';

    case 'ellipse':
      return el.getAttribute('rx') === '0' || el.getAttribute('ry') === '0';

    case 'line':
      const x1 = el.getAttribute('x1');
      const x2 = el.getAttribute('x2');
      const y1 = el.getAttribute('y1');
      const y2 = el.getAttribute('y2');
      return x1 === x2 && y1 === y2;

    case 'path':
      const d = el.getAttribute('d');
      return !d || d.trim() === '' || /^M\s*0\s*0\s*$/i.test(d);
  }

  return false;
}

/** Clean inline styles */
function cleanStyle(el: Element, usedVars: Set<string>) {
  const styleText = el.getAttribute('style');
  if (!styleText) return;

  const declarations = styleText
    .split(';')
    .map(d => d.trim())
    .filter(Boolean);

  if (declarations.length === 0) {
    el.removeAttribute('style');
    return;
  }

  const kept: string[] = [];

  const isRoot = el.getAttribute('xmlns')?.endsWith('xhtml');

  for (const decl of declarations) {
    if (DEFAULT_DECLS.includes(decl)) continue;
    if (!isRoot && ROOT_DECLS.includes(decl)) continue;

    const [rawProp, ...rest] = decl.split(':');
    const prop = rawProp?.trim();
    const val = rest.join(':').trim();
    if (!prop) continue;
    if (prop === 'font-family' && !isRoot) continue;

    /* --- Remove ignored properties --------------------------------- */
    if (IGNORE_PROPS.includes(prop)) continue;
    if (val === 'none' && !ALLOW_NONE.includes(prop)) continue;
    if (val === 'auto' && !ALLOW_AUTO.includes(prop)) continue;
    if (val === '0px' && !ALLOW_0PX.includes(prop)) continue;
    if (val === 'normal' && !ALLOW_NORMAL.includes(prop)) continue;
    if (val === '0' && prop === 'z-index') continue;

    /* --- Remove unused CSS variables -------------------------------- */
    if (prop.startsWith('--') && (!isRoot || !usedVars.has(prop))) continue;

    /* --- Remove vendor prefixed props ------------------------------- */
    if (prop.startsWith('-webkit-')) continue;

    kept.push(`${prop}: ${val}`);
  }

  if (kept.length === 0) el.removeAttribute('style');
  else el.setAttribute('style', kept.join('; '));
}
