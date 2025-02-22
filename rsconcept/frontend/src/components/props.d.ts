// =========== Module contains interfaces for common UI elements. ==========
import type React from 'react';
import { type FieldError } from 'react-hook-form';

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
 * Represents an object that can have an error message.
 */
export interface ErrorProcessing {
  error?: FieldError;
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
 * Represents `button` component with optional title and HTML attributes.
 */
export type Button = Titled & Omit<React.ComponentProps<'button'>, 'children' | 'type'>;
