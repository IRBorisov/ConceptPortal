// =========== Module contains interfaces for common UI elements. ==========
import { HTMLMotionProps } from 'framer-motion';

export namespace CProps {
  export interface Titled {
    title?: string;
    titleHtml?: string;
    hideTitle?: boolean;
  }

  export type Control = Titled & {
    disabled?: boolean;
    noBorder?: boolean;
    noOutline?: boolean;
  };

  export interface Styling {
    style?: React.CSSProperties;
    className?: string;
  }

  export type Editor = Control & {
    label?: string;
  };

  export interface Colors {
    colors?: string;
  }

  export type Div = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  export type Button = Titled &
    Omit<
      React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
      'children' | 'type'
    >;
  export type Label = Omit<
    React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>,
    'children'
  >;
  export type TextArea = Titled &
    React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  export type Input = Titled & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

  export type AnimatedButton = Titled & Omit<HTMLMotionProps<'button'>, 'type'>;
  export type AnimatedDiv = HTMLMotionProps<'div'>;

  export type EventMouse = React.MouseEvent<Element, MouseEvent>;
}
