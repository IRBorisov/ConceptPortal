// =========== Modules contains all dynamic color definitions ==========


// ============= MAIN COLOR THEMES ==========
export interface IColorTheme {  
  bgDefault: string
  bgInput: string
  bgControls: string
  bgDisabled: string
  bgPrimary: string
  bgSelected: string
  bgHover: string
  bgWarning: string
  
  border: string

  fgDefault: string
  fgSelected: string
  fgDisabled: string
  fgWarning: string

  // Hightlight syntax accents
  bgRed: string
  bgGreen: string
  bgBlue: string
  bgPurple: string
  bgTeal: string
  bgOrange: string

  fgRed: string
  fgGreen: string
  fgBlue: string
  fgPurple: string
  fgTeal: string
  fgOrange: string
}

// ======= Light =======
export const lightT: IColorTheme = {
  bgDefault:  'var(--cl-bg-100)',
  bgInput:    'var(--cl-bg-120)',
  bgControls: 'var(--cl-bg-80)',
  bgDisabled: 'var(--cl-bg-60)',
  bgPrimary:  'var(--cl-prim-bg-100)',
  bgSelected: 'var(--cl-prim-bg-80)',
  bgHover:    'var(--cl-prim-bg-60)',
  bgWarning:  'var(--cl-red-bg-100)',
  
  border:     'var(--cl-bg-40)',

  fgDefault:  'var(--cl-fg-100)',
  fgSelected: 'var(--cl-fg-100)',
  fgDisabled: 'var(--cl-fg-80)',
  fgWarning:  'var(--cl-red-fg-100)',

  // Hightlight syntax accents
  bgRed:      'hsl(000, 100%, 089%)',
  bgGreen:    'hsl(100, 100%, 075%)',
  bgBlue:     'hsl(235, 100%, 085%)',
  bgPurple:   'hsl(274, 089%, 081%)',
  bgTeal:     'hsl(192, 089%, 081%)',
  bgOrange:   'hsl(028, 100%, 075%)',

  fgRed:      'hsl(000, 090%, 045%)',
  fgGreen:    'hsl(100, 090%, 035%)',
  fgBlue:     'hsl(235, 100%, 050%)',
  fgPurple:   'hsl(270, 100%, 070%)',
  fgTeal:     'hsl(200, 080%, 050%)',
  fgOrange:   'hsl(030, 090%, 055%)'
};

// ======= DARK ========
export const darkT: IColorTheme = {
  bgDefault:  'var(--cd-bg-100)',
  bgInput:    'var(--cd-bg-120)',
  bgControls: 'var(--cd-bg-80)',
  bgDisabled: 'var(--cd-bg-60)',
  bgPrimary:  'var(--cd-prim-bg-100)',
  bgSelected: 'var(--cd-prim-bg-80)',
  bgHover:    'var(--cd-prim-bg-60)',
  bgWarning:  'var(--cd-red-bg-100)',

  border:     'var(--cd-bg-40)',

  fgDefault:  'var(--cd-fg-100)',
  fgSelected: 'var(--cd-fg-100)',
  fgDisabled: 'var(--cd-fg-80)',
  fgWarning:  'var(--cd-red-fg-100)',

  // Hightlight syntax accents
  bgRed:      'hsl(000, 080%, 037%)',
  bgGreen:    'hsl(100, 080%, 025%)',
  bgBlue:     'hsl(235, 054%, 049%)',
  bgPurple:   'hsl(270, 080%, 050%)',
  bgTeal:     'hsl(192, 080%, 030%)',
  bgOrange:   'hsl(035, 100%, 035%)',

  fgRed:      'hsl(000, 080%, 045%)',
  fgGreen:    'hsl(100, 080%, 035%)',
  fgBlue:     'hsl(235, 100%, 080%)',
  fgPurple:   'hsl(270, 100%, 080%)',
  fgTeal:     'hsl(192, 100%, 030%)',
  fgOrange:   'hsl(035, 100%, 050%)'
};

// ============ SELECT THEMES ==========
export const selectLightT = {
  primary: lightT.bgPrimary,
  primary75: lightT.bgSelected,
  primary50: lightT.bgHover,
  primary25: lightT.bgHover,

  danger: lightT.fgWarning,
  dangerLight: lightT.bgWarning,

  neutral0: lightT.bgInput,
  neutral5: lightT.bgDefault,
  neutral10: lightT.border,
  neutral20: lightT.border,
  neutral30: lightT.border,
  neutral40: lightT.fgDisabled,
  neutral50: lightT.fgDisabled, // placeholder
  neutral60: lightT.fgDefault,
  neutral70: lightT.fgWarning,
  neutral80: lightT.fgDefault,
  neutral90: lightT.fgWarning
}

export const selectDarkT = {
  primary: darkT.bgPrimary,
  primary75: darkT.bgSelected,
  primary50: darkT.bgHover,
  primary25: darkT.bgHover,

  danger: darkT.fgWarning,
  dangerLight: darkT.bgWarning,

  neutral0: darkT.bgInput,
  neutral5: darkT.bgDefault,
  neutral10: darkT.border,
  neutral20: darkT.border,
  neutral30: darkT.border,
  neutral40: darkT.fgDisabled,
  neutral50: darkT.fgDisabled, // placeholder
  neutral60: darkT.fgDefault,
  neutral70: darkT.fgWarning,
  neutral80: darkT.fgDefault,
  neutral90: darkT.fgWarning
}

// ============ GRAPH THEMES ==========
export const graphLightT = {
  canvas: {
    background: '#f9fafb',
  },
  node: {
    fill: '#7ca0ab',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.2,
    label: {
        color: '#2A6475',
        stroke: '#fff',
        activeColor: '#1DE9AC'
    }
  },
  lasso: {
    border: '1px solid #55aaff',
    background: 'rgba(75, 160, 255, 0.1)'
  },
  ring: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC'
  },
  edge: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      stroke: '#fff',
      color: '#2A6475',
      activeColor: '#1DE9AC'
    }
  },
  arrow: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC'
  },
  cluster: {
    stroke: '#D8E6EA',
    label: {
      stroke: '#fff',
      color: '#2A6475'
    }
  }
}

export const graphDarkT = {
  canvas: {
    background: '#181818' // var(--cd-bg-100)
  },
  node: {
    fill: '#7a8c9e',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.2,
    label: {
      stroke: '#1E2026',
      color: '#ACBAC7',
      activeColor: '#1DE9AC'
    }
  },
  lasso: {
    border: '1px solid #55aaff',
    background: 'rgba(75, 160, 255, 0.1)'
  },
  ring: {
    fill: '#54616D',
    activeFill: '#1DE9AC'
  },
  edge: {
    fill: '#474B56',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      stroke: '#1E2026',
      color: '#ACBAC7',
      activeColor: '#1DE9AC'
    }
  },
  arrow: {
    fill: '#474B56',
    activeFill: '#1DE9AC'
  },
  cluster: {
    stroke: '#474B56',
    label: {
      stroke: '#1E2026',
      color: '#ACBAC7'
    }
  }
}

// ======== Bracket Matching Themes ===========
export const bracketsLightT = {
  '.cc-nonmatchingBracket': {
    color: lightT.fgRed,
    fontWeight: 700,
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: lightT.bgSelected,
    color: lightT.fgSelected
  },
};

export const bracketsDarkT = {
  '.cc-nonmatchingBracket': {
    color: darkT.fgRed,
    fontWeight: 700,
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: darkT.bgSelected,
    color: darkT.fgSelected
  },
};
