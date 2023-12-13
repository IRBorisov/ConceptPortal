// =========== Module contains interfaces for common UI elements. ==========
export interface IControlProps {
  tooltip?: string
  dimensions?: string
  
  disabled?: boolean
  noBorder?: boolean
  noOutline?: boolean
}

export interface IEditorProps extends IControlProps {
  label?: string
}

export interface IColorsProps {
  colors?: string
}
