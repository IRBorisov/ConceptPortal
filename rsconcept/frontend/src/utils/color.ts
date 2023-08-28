export interface IColorTheme {
  red: string
  green: string
  blue: string
  teal: string
  orange: string

  text: string

  input: string
  inputDisabled: string
  selection: string
  selectionError: string

  // bg100: string
  // bg70: string
  // bg50: string

  // fg100: string
  // fg70: string
  // fg50: string

  // primary: string
  // secondary: string
}

// =========== GENERAL THEMES =========
export const lightT: IColorTheme = {
  red: '#ffc9c9',
  green: '#aaff80',
  blue: '#b3bdff',
  teal: '#a5e9fa',
  orange: '#ffbb80',

  text: '#000000',

  input: '#ffffff',
  inputDisabled: '#f0f2f7',
  selection: '#def1ff',
  selectionError: '#ffc9c9'
};

export const darkT: IColorTheme = {
  red: '#bf0d00',
  green: '#2b8000',
  blue: '#394bbf',
  teal: '#0099bf',
  orange: '#964600',

  text: '#e4e4e7',
  
  input: '#070b12',
  inputDisabled: '#374151', // bg-gray-700
  selection: '#8c6000',
  selectionError: '#592b2b'
};


// ========= DATA TABLE THEMES ========
export const dataTableLightT = {
  divider: {
    default: '#d1d5db'
  },
  striped: {
    default: '#f0f2f7'
  },
}

export const dataTableDarkT = {
  text: {
    primary: 'rgba(228, 228, 231, 1)',
    secondary: 'rgba(228, 228, 231, 0.87)',
    disabled: 'rgba(228, 228, 231, 0.54)'
  },
  background: {
    default: '#181818'
  },
  highlightOnHover: {
    default: '#606060',
    text: 'rgba(228, 228, 231, 1)'
  },
  divider: {
    default: '#6b6b6b'
  },
  striped: {
    default: '#272727',
    text: 'rgba(228, 228, 228, 1)'
  },
  selected: {
    default: '#181818',
    text: 'rgba(228, 228, 231, 1)'
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
    background: '#1f2937'
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
  '.cc-matchingBracket': {
    fontWeight: 600,
  },
  '.cc-nonmatchingBracket': {
    color: '#ef4444',
    fontWeight: 700,
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: '#dae6f2',
  },
};

export const bracketsDarkT = {
  '.cc-matchingBracket': {
    fontWeight: 600,
  },
  '.cc-nonmatchingBracket': {
    color: '#ef4444',
    fontWeight: 700,
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: '#734f00',
  },
};
