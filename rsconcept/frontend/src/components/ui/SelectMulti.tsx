'use client';

import Select, {
  ClearIndicatorProps,
  components,
  DropdownIndicatorProps,
  GroupBase,
  Props,
  StylesConfig
} from 'react-select';

import useWindowSize from '@/hooks/useWindowSize';
import { APP_COLORS, SELECT_THEME } from '@/styling/color';

import { IconClose, IconDropArrow, IconDropArrowUp } from '../Icons';

function DropdownIndicator<Option, Group extends GroupBase<Option> = GroupBase<Option>>(
  props: DropdownIndicatorProps<Option, true, Group>
) {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        {props.selectProps.menuIsOpen ? <IconDropArrowUp size='1.25rem' /> : <IconDropArrow size='1.25rem' />}
      </components.DropdownIndicator>
    )
  );
}

function ClearIndicator<Option, Group extends GroupBase<Option> = GroupBase<Option>>(
  props: ClearIndicatorProps<Option, true, Group>
) {
  return (
    components.ClearIndicator && (
      <components.ClearIndicator {...props}>
        <IconClose size='1.25rem' />
      </components.ClearIndicator>
    )
  );
}

export interface SelectMultiProps<Option, Group extends GroupBase<Option> = GroupBase<Option>>
  extends Omit<Props<Option, true, Group>, 'theme' | 'menuPortalTarget'> {
  noPortal?: boolean;
}

/**
 * Displays a multi-select component.
 */
function SelectMulti<Option, Group extends GroupBase<Option> = GroupBase<Option>>({
  noPortal,
  ...restProps
}: SelectMultiProps<Option, Group>) {
  const size = useWindowSize();

  const adjustedStyles: StylesConfig<Option, true, Group> = {
    container: defaultStyles => ({
      ...defaultStyles,
      borderRadius: '0.25rem'
    }),
    control: (styles, { isDisabled }) => ({
      ...styles,
      borderRadius: '0.25rem',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      boxShadow: 'none'
    }),
    option: (styles, { isSelected }) => ({
      ...styles,
      padding: '0.25rem 0.75rem',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      backgroundColor: isSelected ? APP_COLORS.bgSelected : styles.backgroundColor,
      color: isSelected ? APP_COLORS.fgSelected : styles.color,
      borderWidth: '1px',
      borderColor: APP_COLORS.border
    }),
    menuPortal: styles => ({
      ...styles,
      zIndex: 9999
    }),
    menuList: styles => ({
      ...styles,
      padding: 0
    }),
    input: styles => ({ ...styles }),
    placeholder: styles => ({ ...styles }),
    multiValue: styles => ({
      ...styles,
      borderRadius: '0.5rem',
      backgroundColor: APP_COLORS.bgSelected
    }),
    dropdownIndicator: base => ({
      ...base,
      paddingTop: 0,
      paddingBottom: 0
    }),
    clearIndicator: base => ({
      ...base,
      paddingTop: 0,
      paddingBottom: 0
    })
  };

  return (
    <Select
      isMulti
      noOptionsMessage={() => 'Список пуст'}
      components={{ DropdownIndicator, ClearIndicator }}
      theme={theme => ({
        ...theme,
        borderRadius: 0,
        spacing: {
          ...theme.spacing, // prettier: split-lines
          baseUnit: size.isSmall ? 2 : 4,
          menuGutter: size.isSmall ? 4 : 8,
          controlHeight: size.isSmall ? 28 : 38
        },
        colors: {
          ...theme.colors,
          ...SELECT_THEME
        }
      })}
      menuPortalTarget={!noPortal ? document.body : null}
      styles={adjustedStyles}
      classNames={{ container: () => 'focus-frame' }}
      {...restProps}
    />
  );
}

export default SelectMulti;
