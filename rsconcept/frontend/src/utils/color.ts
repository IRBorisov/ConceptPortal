export interface IColorTheme {
  red: string
  green: string
  blue: string
  teal: string
  orange: string
  
  bgDefault: string
  bgInput: string
  bgControls: string
  bgDisabled: string
  bgHover: string
  bgSelected: string
  bgWarning: string
  
  border: string

  fgDefault: string
  fgDisabled: string
  fgWarning: string
}

// =========== GENERAL THEMES =========
export const lightT: IColorTheme = {
  red: '#ffc9c9',
  green: '#aaff80',
  blue: '#b3bdff',
  teal: '#a5e9fa',
  orange: '#ffbb80',

  bgDefault: 'var(--cl-bg-100)',
  bgInput: 'var(--cl-bg-120)',
  bgControls: 'var(--cl-bg-80)',
  bgDisabled: 'var(--cl-bg-60)',
  bgHover: 'var(--cl-prim-bg-60)',
  bgSelected: 'var(--cl-prim-bg-80)',
  bgWarning: 'var(--cl-red-bg-100)',
  
  border: 'var(--cl-bg-40)',

  fgDefault: 'var(--cl-fg-100)',
  fgDisabled: 'var(--cl-fg-60)',
  fgWarning: 'var(--cl-red-fg-100)'
};

export const darkT: IColorTheme = {
  red: '#bf0d00',
  green: '#2b8000',
  blue: '#394bbf',
  teal: '#007a99',
  orange: '#964600',

  bgDefault: 'var(--cd-bg-100)',
  bgInput: 'var(--cd-bg-120)',
  bgControls: 'var(--cd-bg-80)',
  bgDisabled: 'var(--cd-bg-60)',
  bgHover: 'var(--cd-prim-bg-60)',
  bgSelected: 'var(--cd-prim-bg-80)',
  bgWarning: 'var(--cd-red-bg-100)',

  border: 'var(--cd-bg-40)',

  fgDefault: 'var(--cd-fg-100)',
  fgDisabled: 'var(--cd-fg-60)',
  fgWarning: 'var(--cd-red-fg-100)'
};


// ========= DATA TABLE THEMES ========
export const dataTableLightT = {
  text: {
    primary: lightT.fgDefault,
    secondary: lightT.fgDefault,
    disabled: lightT.fgDisabled
  },
  background: {
    default: lightT.bgDefault
  },
  highlightOnHover: {
    default: lightT.bgHover,
    text: lightT.fgDefault
  },
  divider: {
    default: lightT.border
  },
  striped: {
    default: lightT.bgControls,
    text: lightT.fgDefault
  },
  selected: {
    default: lightT.bgSelected,
    text: lightT.fgDefault
  }
}

export const dataTableDarkT = {
  text: {
    primary: darkT.fgDefault,
    secondary: darkT.fgDefault,
    disabled: darkT.fgDisabled
  },
  background: {
    default: darkT.bgDefault
  },
  highlightOnHover: {
    default: darkT.bgHover,
    text: darkT.fgDefault
  },
  divider: {
    default: darkT.border
  },
  striped: {
    default: darkT.bgControls,
    text: darkT.fgDefault
  },
  selected: {
    default: darkT.bgSelected,
    text: darkT.fgDefault
  }
};

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
    color: lightT.fgWarning,
    fontWeight: 700,
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: lightT.bgSelected,
  },
};

export const bracketsDarkT = {
  '.cc-nonmatchingBracket': {
    color: darkT.fgWarning,
    fontWeight: 700,
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: darkT.bgSelected,
  },
};
