import { useCallback } from 'react';

import { Grammeme } from '../../models/language';
import { prefixes } from '../../utils/constants';
import { IGrammemeOption, PremadeWordForms, SelectorGrammems } from '../../utils/selectors';
import WordformButton from './WordformButton';

interface SelectWordFormProps {
  selected: IGrammemeOption[]
  setSelected: React.Dispatch<React.SetStateAction<IGrammemeOption[]>>
}

function SelectWordForm({ selected, setSelected }: SelectWordFormProps) {
  const handleSelect = useCallback(
  (grams: Grammeme[]) => {
    setSelected(SelectorGrammems.filter(({value}) => grams.includes(value as Grammeme)));
  }, [setSelected]);

  return (
  <div className='flex flex-col items-center w-full text-sm'>
    <div className='flex flex-start'>
    {PremadeWordForms.slice(0, 6).map(
    (data, index) => 
      <WordformButton key={`${prefixes.wordform_list}${index}`}
        text={data.text} example={data.example} grams={data.grams}
        isSelected={data.grams.every(gram => selected.find(item => item.value as Grammeme === gram))}
        onSelectGrams={handleSelect}
      />
    )}
    </div>

    <div className='flex flex-start'>
    {PremadeWordForms.slice(6, 12).map(
    (data, index) => 
      <WordformButton key={`${prefixes.wordform_list}${index}`}
        text={data.text} example={data.example} grams={data.grams}
        isSelected={data.grams.every(gram => selected.find(item => item.value as Grammeme === gram))}
        onSelectGrams={handleSelect}
      />
    )}
    </div>
  </div>);
}

export default SelectWordForm;