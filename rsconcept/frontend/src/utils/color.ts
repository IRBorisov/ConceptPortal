export interface IColorTheme {
  red: string
  green: string
  blue: string
  teal: string
  orange: string

  // bg100: string
  // bg70: string
  // bg50: string

  // fg100: string
  // fg70: string
  // fg50: string

  // primary: string
  // secondary: string
}

export const lightT: IColorTheme = {
  red: '#ffc9c9',
  green: '#aaff80',
  blue: '#b3bdff',
  teal: '#a5e9fa',
  orange: '#ffbb80',
};

export const darkT: IColorTheme = {
  red: '#bf0d00',
  green: '#2b8000',
  blue: '#394bbf',
  teal: '#0099bf',
  orange: '#964600',
};
