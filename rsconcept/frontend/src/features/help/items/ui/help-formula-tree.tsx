export function HelpFormulaTree() {
  return (
    <div>
      <h1>Дерево разбора выражения</h1>
      <p>Дерево получено путем семантических преобразований дерева синтаксического разбора.</p>
      <p>Оно отражает структуру грамматически корректного выражения языка родов структур.</p>

      <ul>
        <li>Порядок узлов в рамках одного уровня может отличаться от их порядка в выражении</li>
        <li>При наведении курсора на узел в тексте выделяется соответствующий ему фрагмент</li>
        <li>Текст в узле дерева соответствует элементу языка</li>
      </ul>

      <h2>Виды узлов</h2>
      <p className='m-0'>
        <span className='cc-sample-color bg-(--acc-bg-green)' />
        объявление идентификатора
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-(--acc-bg-teal)' />
        глобальный идентификатор
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-(--acc-bg-orange)' />
        логическое выражение
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-(--acc-bg-blue)' />
        типизированное выражение
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-(--acc-bg-red)' />
        присвоение и итерация
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-secondary' />
        составные выражения
      </p>

      <h2>Команды</h2>
      <ul>
        <li>
          <kbd>Space</kbd> – перемещение экрана
        </li>
      </ul>
    </div>
  );
}
