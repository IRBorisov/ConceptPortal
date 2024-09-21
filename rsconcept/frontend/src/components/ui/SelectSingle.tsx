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

function SelectSingle<Option, Group extends GroupBase<Option> = GroupBase<Option>>({
  noPortal,
  noBorder,
  ...restProps
}: SelectSingleProps<Option, Group>) {
  const { darkMode, colors } = useConceptOptions();
  const size = useWindowSize();
  const themeColors = useMemo(() => (!darkMode ? selectLightT : selectDarkT), [darkMode]);

  const adjustedStyles: StylesConfig<Option, false, Group> = useMemo(
    () => ({
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
        backgroundColor: isSelected ? colors.bgSelected : defaultStyles.backgroundColor,
        color: isSelected ? colors.fgSelected : defaultStyles.color,
        borderWidth: '1px',
        borderColor: colors.border
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
    }),
    [colors, noBorder]
  );

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

export default SelectSingle;
