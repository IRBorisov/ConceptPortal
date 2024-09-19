// =========== Module contains interfaces for common UI elements. ==========
import { HTMLMotionProps } from 'framer-motion';

export namespace CProps {
  /**
   * Represents an object that can have inline styles and CSS class names for styling.
   */
  export interface Styling {
    /** Optional inline styles for the component. */
    style?: React.CSSProperties;

    /** Optional CSS class name(s) for the component. */
    className?: string;
  }

  /**
   * Represents an object that can have a color or set of colors.
   */
  export interface Colors {
    /** Optional color or set of colors applied via classNames. */
    colors?: string;
  }

  /**
   * Represents an object that can have a title with optional HTML rendering and a flag to hide the title.
   */
  export interface Titled {
    /** Tooltip: `plain text`. */
    title?: string;

    /** Tooltip: `HTML formatted`. */
    titleHtml?: string;

    /** Indicates whether the `title` should be hidden. */
    hideTitle?: boolean;
  }

  /**
   * Represents `control` component with optional title and configuration options.
   *
   * @remarks
   * This type extends the {@link Titled} interface, adding properties to control the visual and interactive behavior of a component.
   */
  export type Control = Titled & {
    /** Indicates whether the control is disabled. */
    disabled?: boolean;

    /** Indicates whether the control should render without a border. */
    noBorder?: boolean;

    /** Indicates whether the control should render without an outline. */
    noOutline?: boolean;
  };

  /**
   * Represents `editor` component that includes a label, control features, and optional title properties.
   *
   * @remarks
   * This type extends the {@link Control} type, inheriting title-related properties and additional configuration options, while also adding an optional label.
   */
  export type Editor = Control & {
    /** Text label. */
    label?: string;
  };

  /**
   * Represents `div` component with all standard HTML attributes and React-specific properties.
   */
  export type Div = React.ComponentProps<'div'>;

  /**
   * Represents `button` component with optional title and HTML attributes.
   */
  export type Button = Titled & Omit<React.ComponentProps<'button'>, 'children' | 'type'>;

  /**
   * Represents `label` component with HTML attributes.
   */
  export type Label = Omit<React.ComponentProps<'label'>, 'children'>;

  /**
   * Represents `textarea` component with optional title and HTML attributes.
   */
  export type TextArea = Titled & React.ComponentProps<'textarea'>;

  /**
   * Represents `input` component with optional title and HTML attributes.
   */
  export type Input = Titled & React.ComponentProps<'input'>;

  /**
   * Represents `button` component with optional title and animation properties.
   */
  export type AnimatedButton = Titled & Omit<HTMLMotionProps<'button'>, 'type'>;

  /**
   * Represents `div` component with animation properties.
   */
  export type AnimatedDiv = HTMLMotionProps<'div'>;

  /**
   * Represents `mouse event` in React.
   */
  export type EventMouse = React.MouseEvent<Element, MouseEvent>;
}
