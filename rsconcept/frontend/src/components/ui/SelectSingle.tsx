'use client';

import { useMemo } from 'react';
import Select, { GroupBase, Props, StylesConfig } from 'react-select';

import { useConceptOptions } from '@/context/OptionsContext';
import { selectDarkT, selectLightT } from '@/styling/color';

interface SelectSingleProps<Option, Group extends GroupBase<Option> = GroupBase<Option>>
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
  const themeColors = useMemo(() => (!darkMode ? selectLightT : selectDarkT), [darkMode]);

  const adjustedStyles: StylesConfig<Option, false, Group> = useMemo(
    () => ({
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
        padding: '0px'
      }),
      option: (defaultStyles, { isSelected }) => ({
        ...defaultStyles,
        backgroundColor: isSelected ? colors.bgSelected : defaultStyles.backgroundColor,
        color: isSelected ? colors.fgSelected : defaultStyles.color,
        borderWidth: '1px',
        borderColor: colors.border
      }),
      input: defaultStyles => ({ ...defaultStyles }),
      placeholder: defaultStyles => ({ ...defaultStyles }),
      singleValue: defaultStyles => ({ ...defaultStyles })
    }),
    [colors, noBorder]
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
