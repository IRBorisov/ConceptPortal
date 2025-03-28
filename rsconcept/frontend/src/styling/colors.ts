/**
 * Module: Single place for all color definitions in code (see index.css for full defs).
 */

/** Semantic colors for application. */
// prettier-ignore
export const APP_COLORS = {
  bgDefault:          'var(--clr-prim-100)',
  bgInput:            'var(--clr-prim-0)', 
  bgControls:         'var(--clr-prim-200)',
  bgDisabled:         'var(--clr-prim-300)',
  bgPrimary:          'var(--clr-sec-600)',
  bgSelected:         'var(--clr-sec-200)',
  bgActiveSelection:  'var(--clr-select-node)',
  bgHover:            'var(--clr-sec-100)',
  bgWarning:          'var(--clr-warn-100)',
  
  border:             'var(--clr-prim-400)',

  fgDefault:          'var(--clr-prim-999)',
  fgSelected:         'var(--clr-prim-999)', 
  fgDisabled:         'var(--clr-prim-800)',
  fgWarning:          'var(--clr-warn-600)',

  bgRed:              'var(--acc-bg-red)',
  bgGreen:            'var(--acc-bg-green)',
  bgBlue:             'var(--acc-bg-blue)',
  bgPurple:           'var(--acc-bg-purple)',
  bgTeal:             'var(--acc-bg-teal)',
  bgOrange:           'var(--acc-bg-orange)',

  bgGreen25:          'var(--acc-bg-green25)',
  bgGreen50:          'var(--acc-bg-green50)',
  bgOrange50:         'var(--acc-bg-orange50)',

  fgRed:              'var(--acc-fg-red)',
  fgGreen:            'var(--acc-fg-green)',
  fgBlue:             'var(--acc-fg-blue)',
  fgPurple:           'var(--acc-fg-purple)',
  fgTeal:             'var(--acc-fg-teal)',
  fgOrange:           'var(--acc-fg-orange)'
}

/** Represents Select component theme. */
export const SELECT_THEME = {
  primary: APP_COLORS.bgPrimary,
  primary75: APP_COLORS.bgSelected,
  primary50: APP_COLORS.bgHover,
  primary25: APP_COLORS.bgHover,

  danger: APP_COLORS.fgWarning,
  dangerLight: APP_COLORS.bgWarning,

  neutral0: APP_COLORS.bgInput,
  neutral5: APP_COLORS.bgDefault,
  neutral10: APP_COLORS.border,
  neutral20: APP_COLORS.border,
  neutral30: APP_COLORS.border,
  neutral40: APP_COLORS.fgDisabled,
  neutral50: APP_COLORS.fgDisabled, // placeholder
  neutral60: APP_COLORS.fgDefault,
  neutral70: APP_COLORS.fgWarning,
  neutral80: APP_COLORS.fgDefault,
  neutral90: APP_COLORS.fgWarning
};
