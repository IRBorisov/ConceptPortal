import { useConceptOptions } from '@/context/ConceptOptionsContext';

function HelpFormulaTree() {
  const { colors } = useConceptOptions();
  return (
    <div>
      <h1>Дерево разбора выражения</h1>
      <p>Дерево получено путем семантических преобразований дерева синтаксического разбора.</p>
      <p>Оно отражает структуру грамматически корректного выражения языка родов структур.</p>
      <li>Порядок узлов в рамках одного уровня может отличаться от их порядка в выражении</li>
      <li>При наведении курсора на узел в тексте выделяется соответствующий ему фрагмент</li>
      <li>Текст в узле дерева соответствует элементу языка</li>

      <h2>Виды узлов</h2>
      <li>
        <span style={{ backgroundColor: colors.bgGreen }}>объявление идентификатора</span>
      </li>
      <li>
        <span style={{ backgroundColor: colors.bgTeal }}>глобальный идентификатор</span>
      </li>
      <li>
        <span style={{ backgroundColor: colors.bgOrange }}>логическое выражение</span>
      </li>
      <li>
        <span style={{ backgroundColor: colors.bgBlue }}>типизированное выражение</span>
      </li>
      <li>
        <span style={{ backgroundColor: colors.bgRed }}>присвоение и итерация</span>
      </li>
      <li>
        <span style={{ backgroundColor: colors.bgDisabled }}>составные выражения</span>
      </li>
    </div>
  );
}

export default HelpFormulaTree;
