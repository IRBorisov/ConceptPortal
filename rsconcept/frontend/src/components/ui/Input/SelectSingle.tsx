'use client';

import Select, {
  ClearIndicatorProps,
  components,
  DropdownIndicatorProps,
  GroupBase,
  Props,
  StylesConfig
} from 'react-select';

import { IconClose, IconDropArrow, IconDropArrowUp } from '@/components/Icons';
import useWindowSize from '@/hooks/useWindowSize';
import { APP_COLORS, SELECT_THEME } from '@/styling/color';

function DropdownIndicator<Option, Group extends GroupBase<Option> = GroupBase<Option>>(
  props: DropdownIndicatorProps<Option, false, Group>
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
  props: ClearIndicatorProps<Option, false, Group>
) {
  return (
    components.ClearIndicator && (
      <components.ClearIndicator {...props}>
        <IconClose size='1.25rem' />
      </components.ClearIndicator>
    )
  );
}

export interface SelectSingleProps<Option, Group extends GroupBase<Option> = GroupBase<Option>>
  extends Omit<Props<Option, false, Group>, 'theme' | 'menuPortalTarget'> {
  noPortal?: boolean;
  noBorder?: boolean;
}

/**
 * Displays a single-select component.
 */
export function SelectSingle<Option, Group extends GroupBase<Option> = GroupBase<Option>>({
  noPortal,
  noBorder,
  ...restProps
}: SelectSingleProps<Option, Group>) {
  const size = useWindowSize();

  const adjustedStyles: StylesConfig<Option, false, Group> = {
    container: defaultStyles => ({
      ...defaultStyles,
      borderRadius: '0.25rem'
    }),
    control: (defaultStyles, { isDisabled }) => ({
      ...defaultStyles,
      borderRadius: '0.25rem',
      ...(noBorder ? { borderWidth: 0 } : {}),
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      boxShadow: 'none'
    }),
    menuPortal: defaultStyles => ({
      ...defaultStyles,
      zIndex: 9999
    }),
    menuList: defaultStyles => ({
      ...defaultStyles,
      padding: 0
    }),
    option: (defaultStyles, { isSelected }) => ({
      ...defaultStyles,
      padding: '0.25rem 0.75rem',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      backgroundColor: isSelected ? APP_COLORS.bgSelected : defaultStyles.backgroundColor,
      color: isSelected ? APP_COLORS.fgSelected : defaultStyles.color,
      borderWidth: '1px',
      borderColor: APP_COLORS.border
    }),
    input: defaultStyles => ({ ...defaultStyles }),
    placeholder: defaultStyles => ({ ...defaultStyles }),
    singleValue: defaultStyles => ({ ...defaultStyles }),
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
      noOptionsMessage={() => 'Список пуст'}
      components={{ DropdownIndicator, ClearIndicator }}
      theme={theme => ({
        ...theme,
        borderRadius: 0,
        spacing: {
          ...theme.spacing, // prettier: split-lines
          baseUnit: size.isSmall ? 2 : 4,
          menuGutter: 2,
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
