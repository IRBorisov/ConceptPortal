'use client';

import { useMemo } from 'react';
import Select, {
  ClearIndicatorProps,
  components,
  DropdownIndicatorProps,
  GroupBase,
  Props,
  StylesConfig
} from 'react-select';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import useWindowSize from '@/hooks/useWindowSize';
import { selectDarkT, selectLightT } from '@/styling/color';

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

function SelectMulti<Option, Group extends GroupBase<Option> = GroupBase<Option>>({
  noPortal,
  ...restProps
}: SelectMultiProps<Option, Group>) {
  const { darkMode, colors } = useConceptOptions();
  const size = useWindowSize();
  const themeColors = useMemo(() => (!darkMode ? selectLightT : selectDarkT), [darkMode]);

  const adjustedStyles: StylesConfig<Option, true, Group> = useMemo(
    () => ({
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
        backgroundColor: isSelected ? colors.bgSelected : styles.backgroundColor,
        color: isSelected ? colors.fgSelected : styles.color,
        borderWidth: '1px',
        borderColor: colors.border
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
        backgroundColor: colors.bgSelected
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
    }),
    [colors]
  );

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
          ...themeColors
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
