export function HelpFormulaTree() {
  return (
    <div>
      <h1>Дерево разбора выражения</h1>
      <p>Дерево синтаксического разбора отражает структуру выражения.</p>

      <ul>
        <li>Текст в узле дерева соответствует элементу языка</li>
        <li>При наведении на узел выделяется фрагмент выражения и отображается типизация</li>
        <li>
          <kbd>Пробел</kbd> – перемещение экрана без наведения на узлы
        </li>
      </ul>

      <h2>Виды узлов</h2>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-green' />
        объявление идентификатора
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-teal' />
        глобальный идентификатор
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-orange' />
        логическое выражение
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-blue' />
        типизированное выражение
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-red' />
        присвоение и итерация
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-secondary' />
        составные выражения
      </p>
    </div>
  );
}
