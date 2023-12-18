// =========== Module contains interfaces for common UI elements. ==========
export namespace CProps {

export type Control = {
  title?: string
  disabled?: boolean
  noBorder?: boolean
  noOutline?: boolean
}

export type Styling = {
  style?: React.CSSProperties
  className?: string
}

export type Editor = Control & {
  label?: string
}

export type Colors = {
  colors?: string
}

export type Div = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export type Button = Omit<
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  'children' | 'type'
>;
export type Label = Omit<
  React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>,
  'children'
>;
export type TextArea = React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
export type Input = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

}