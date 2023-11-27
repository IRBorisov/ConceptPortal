import { useMemo } from 'react';
import Select, { GroupBase, Props, StylesConfig } from 'react-select';

import { useConceptTheme } from '../../context/ThemeContext';
import { selectDarkT, selectLightT } from '../../utils/color';

interface SelectMultiProps<
  Option,
  Group extends GroupBase<Option> = GroupBase<Option>
>
extends Omit<Props<Option, true, Group>, 'theme'> {
}

function SelectMulti<
  Option,
  Group extends GroupBase<Option> = GroupBase<Option>
> (props: SelectMultiProps<Option, Group>) {
  const { darkMode, colors } = useConceptTheme();
  const themeColors = useMemo(
    () => !darkMode ? selectLightT : selectDarkT
  , [darkMode]);

  const adjustedStyles: StylesConfig<Option, true, Group> = useMemo(
  () => ({
    control: (styles, { isDisabled }) => ({
      ...styles,
      borderRadius: '0.25rem',
      cursor: isDisabled ? 'not-allowed' : 'pointer'
    }),

    option: (styles, { isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? colors.bgSelected : styles.backgroundColor,
      color: isSelected ? colors.fgSelected : styles.color,
      borderWidth: '1px',
      borderColor: colors.border
    }),
    menuList: (styles) => ({
      ...styles,
      padding: '0px'
    }),
    input: (styles) => ({...styles}),
    placeholder: (styles) => ({...styles}),
    multiValue: styles => ({
      ...styles,
      borderRadius: '0.5rem',
      backgroundColor: colors.bgSelected,
    }),
    
  }), [colors]);

  return (
    <Select
      noOptionsMessage={() => 'Список пуст'}
      theme={theme => ({
        ...theme,
        borderRadius: 0,
        colors: {
          ...theme.colors,
          ...themeColors
        },
      })}
      isMulti
      styles={adjustedStyles}
      {...props}
    />
  );
}

export default SelectMulti;
