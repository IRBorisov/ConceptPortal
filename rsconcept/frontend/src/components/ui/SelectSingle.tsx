'use client';

import { useMemo } from 'react';
import Select, { GroupBase, Props, StylesConfig } from 'react-select';

import { useConceptTheme } from '@/context/ThemeContext';
import { selectDarkT, selectLightT } from '@/utils/color';

interface SelectSingleProps<Option, Group extends GroupBase<Option> = GroupBase<Option>>
  extends Omit<Props<Option, false, Group>, 'theme' | 'menuPortalTarget'> {
  noPortal?: boolean;
}

function SelectSingle<Option, Group extends GroupBase<Option> = GroupBase<Option>>({
  noPortal,
  ...restProps
}: SelectSingleProps<Option, Group>) {
  const { darkMode, colors } = useConceptTheme();
  const themeColors = useMemo(() => (!darkMode ? selectLightT : selectDarkT), [darkMode]);

  const adjustedStyles: StylesConfig<Option, false, Group> = useMemo(
    () => ({
      control: (styles, { isDisabled }) => ({
        ...styles,
        borderRadius: '0.25rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        boxShadow: 'none'
      }),
      menuPortal: styles => ({
        ...styles,
        zIndex: 9999
      }),
      menuList: styles => ({
        ...styles,
        padding: '0px'
      }),
      option: (styles, { isSelected }) => ({
        ...styles,
        backgroundColor: isSelected ? colors.bgSelected : styles.backgroundColor,
        color: isSelected ? colors.fgSelected : styles.color,
        borderWidth: '1px',
        borderColor: colors.border
      }),
      input: styles => ({ ...styles }),
      placeholder: styles => ({ ...styles }),
      singleValue: styles => ({ ...styles })
    }),
    [colors]
  );

  return (
    <Select
      noOptionsMessage={() => 'Список пуст'}
      theme={theme => ({
        ...theme,
        borderRadius: 0,
        colors: {
          ...theme.colors,
          ...themeColors
        }
      })}
      menuPortalTarget={!noPortal ? document.body : null}
      styles={adjustedStyles}
      {...restProps}
    />
  );
}

export default SelectSingle;
