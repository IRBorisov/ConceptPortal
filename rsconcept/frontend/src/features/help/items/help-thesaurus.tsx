import {
  IconChild,
  IconConsolidation,
  IconCstAxiom,
  IconCstBaseSet,
  IconCstConstSet,
  IconCstFunction,
  IconCstPredicate,
  IconCstStructured,
  IconCstTerm,
  IconCstTheorem,
  IconDownload,
  IconGraphCollapse,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphOutputs,
  IconOSS,
  IconPredecessor,
  IconRSForm,
  IconRSFormImported,
  IconRSFormOwned,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusOK,
  IconStatusProperty,
  IconStatusUnknown,
  IconSynthesis
} from '@/components/icons';

import { LinkTopic } from '../components/link-topic';
import { HelpTopic } from '../models/help-topic';

export function HelpThesaurus() {
  return (
    <div className='text-justify'>
      <h1>Тезаурус</h1>
      <p>
        Данный раздел содержит основные термины и определения, используемые в работе с Порталом. Термины сгруппированы
        по ключевым сущностям. Более подробно описание отношений между терминами даются в отдельных разделах данной
        Справки через гиперссылки. Также указываются графические обозначения (иконки, цвета), используемые для
        обозначения соответствующих сущностей в интерфейсе Портала.
      </p>

      <h2>Концептуальная схема</h2>
      <p>
        <IconRSForm size='1rem' className='inline-icon' />
        {'\u2009'}
        <LinkTopic text='Концептуальная схема' topic={HelpTopic.CC_SYSTEM} /> (<i>система определений, КС</i>) –
        совокупность отдельных понятий и утверждений, а также связей между ними, задаваемых определениями.
      </p>
      <p>
        Экспликация КС – изложение (процесс и результат) концептуальной схемы с помощью заданного языка описания –
        набора формальных конструкций и правил построения определений.
      </p>
      <p>
        Родоструктурная экспликация КС – экспликация КС с помощью{' '}
        <LinkTopic text='аппарата родов структур' topic={HelpTopic.RSLANG} />.
      </p>
      <p>
        Граф термов – ориентированный граф, узлами которого являются конституенты КС, а связи задаются на основе
        вхождения имени конституенты в определение другой конституенты.
      </p>

      <p>
        Ядро концептуальной схемы – совокупность базовых понятий, аксиом и промежуточных производных понятий,
        необходимых для формирования выражений аксиом. Остальные конституенты относят к Телу концептуальной схемы.
      </p>

      <ul>
        По <b>отношению к операциям ОСС</b> выделены:
        <li>
          <IconRSForm size='1rem' className='inline-icon' />
          {'\u2009'}свободная КС – КС не прикрепленная ни к одной операции в ОСС;
        </li>
        <li>
          <IconRSFormOwned size='1rem' className='inline-icon' />
          {'\u2009'}собственная КС данной ОСС – КС, прикрепленная к операции в ОСС, чьи владелец и расположение
          совпадают с соответствующими атрибутами ОСС.
        </li>
        <li>
          <IconRSFormImported size='1rem' className='inline-icon' />
          {'\u2009'}внешняя КС данной ОСС – КС, прикрепленная к операции в ОСС, чьи владелец или расположение не
          совпадают с соответствующими атрибутами ОСС;
        </li>
      </ul>

      <h2>Конституента</h2>
      <p>
        Конституента – выделенная часть КС, являющаяся отдельным понятием, схемой построения понятия, либо утверждением,
        связывающим введенные понятия. <LinkTopic text='Аттрибутами конституенты' topic={HelpTopic.CC_CONSTITUENTA} /> в
        родоструктурной экспликации являются Термин, Конвенция, Типизация (Структура), Формальное определение, Текстовое
        определение, Комментарий.
      </p>
      <ul>
        По <b>характеру формального определения в рамках КС</b> выделены классы:
        <li>
          базовое понятие (<i>неопределяемое понятие</i>) не имеет определения и задано конвенцией и аксиомами;
        </li>
        <li>
          производное понятие (<i>выводимое понятие</i>) имеет определение.
        </li>
        <li>утверждение определяется через логическое выражение.</li>
        <li>шаблон определения содержит несвязанный параметр в определении.</li>
      </ul>

      <br />

      <ul>
        По <b>назначению</b> выделены типы конституент:
        <li>
          <IconCstBaseSet size='1rem' className='inline-icon' />
          {'\u2009'}базисное множество (X#) представляет неопределяемое понятие, представленное структурой множества,
          чьи элементы различимы и не сравнимы с элементами других базисных множеств;
        </li>
        <li>
          <IconCstConstSet size='1rem' className='inline-icon' />
          {'\u2009'}константное множество (C#) представляет неопределяемое понятие, моделируемое термом теории множеств,
          который поддерживает ряд формальных операций над его элементами;
        </li>
        <li>
          <IconCstStructured size='1rem' className='inline-icon' />
          {'\u2009'}родовая структура (S#) представляет неопределяемое понятие, имеющее определенную структуру,
          построенную на базисных множествах и константных множеств. Содержание родовой структуры формируется{' '}
          <LinkTopic text='отношением типизации' topic={HelpTopic.RSL_TYPES} />, аксиомами и конвенцией;
        </li>
        <li>
          <IconCstAxiom size='1rem' className='inline-icon' />
          {'\u2009'}аксиома (A#) представляет утверждение, ограничивающее неопределяемые понятия и выводимые термы.
          Интерпретация аксиомы должна быть истинна и является критерием корректности интерпретации КС в целом;
        </li>
        <li>
          <IconCstTerm size='1rem' className='inline-icon' />
          {'\u2009'}терм (D#) представляет выводимое понятие через формальное определение;
        </li>
        <li>
          <IconCstFunction size='1rem' className='inline-icon' />
          {'\u2009'}терм-функция (F#) представляет выводимое понятие (возможно параметризованное), имеющее характер
          функционального отношения между набором аргументов и результатом;
        </li>
        <li>
          <IconCstPredicate size='1rem' className='inline-icon' />
          {'\u2009'}предикат-функция (P#) представляет выводимое понятие (возможно параметризованное), имеющее характер
          логического выражения, проверяющее заданные аргументы на соответствие некоторому условию;
        </li>
        <li>
          <IconCstTheorem size='1rem' className='inline-icon' />
          {'\u2009'}теорема (T#) представляет ценное для предметной утверждение, значение которого может быть как
          истинным так и ложным;
        </li>
      </ul>

      <br />

      <ul>
        По <b>графу термов</b> выделены:
        <li>
          <IconGraphOutputs size='1rem' className='inline-icon' />
          {'\u2009'}потребители данной конституенты – конституенты, определения которых используют данную конституенту
        </li>
        <li>
          <IconGraphInputs size='1rem' className='inline-icon' />
          {'\u2009'}поставщики данной конституенты – конституенты, имена которых используются в определении данной
          конституенты
        </li>
        <li>
          <IconGraphExpand size='1rem' className='inline-icon' />
          {'\u2009'}зависимые от данной конституенты – потребители данной конституенты напрямую или по цепочке
        </li>
        <li>
          <IconGraphCollapse size='1rem' className='inline-icon' />
          {'\u2009'}влияющие на данную конституенту – поставщики данной конституенты напрямую или по цепочке
        </li>
      </ul>

      <br />

      <ul>
        Для описания <b>тесно связанных понятий</b> введены следующие термины:
        <li>
          порождающее выражение – формальное определение, основанное на одной внешней конституенте и использующее только
          формальное разворачивание (не вводит нового предметного содержания);
        </li>
        <li>основа данного понятия – понятие, на котором основано порождающее выражение данной конституенты;</li>
        <li>
          порожденное понятие данным понятием – понятие, определением которого является порождающим выражением,
          основанным на данном понятии.
        </li>
      </ul>

      <br />

      <ul>
        Для характеристики <b>корректности определения</b> введены статусы конституент:
        <li>
          <IconStatusUnknown size='1rem' className='inline-icon' />
          {'\u2009'}не проверено – требуется проверка формального определения (промежуточный статус);
        </li>
        <li>
          <IconStatusOK size='1rem' className='inline-icon' />
          {'\u2009'}корректно – формальное определение корректно;
        </li>
        <li>
          <IconStatusError size='1rem' className='inline-icon' />
          {'\u2009'}ошибочно – ошибка в формальном определении;
        </li>
        <li>
          <IconStatusProperty size='1rem' className='inline-icon' />
          {'\u2009'}неразмерное – формальное определение задает невычислимое множество, для которого возможно вычислить
          предикат проверки принадлежности;
        </li>
        <li>
          <IconStatusIncalculable size='1rem' className='inline-icon' />
          {'\u2009'}невычислимо – формальное определение невозможно интерпретировать напрямую;
        </li>
      </ul>

      <br />

      <ul>
        Для описания <b>отождествления</b> введены:
        <li>отождествляемые конституенты – конституенты, состоящие в отождествлении;</li>
        <li>удаляемая конституента – конституента, удаляемая в ходе отождествления;</li>
        <li>
          замещающая конституента – конституента, обозначение которой замещает обозначение удаляемой конституенты в
          формальных выражениях иных конституент в ходе отождествления;
        </li>
      </ul>

      <br />

      <ul>
        Для описания <b>наследования</b> конституент в рамках ОСС введены:
        <li>
          <IconChild size='1rem' className='inline-icon' />
          {'\u2009'}наследованная конституента – конституента, перенесенная из другой КС в ходе синтеза;
        </li>
        <li>
          <IconPredecessor size='1rem' className='inline-icon' />
          {'\u2009'}собственная конституента – конституента, не являющаяся наследованной;
        </li>
        <li>
          <IconPredecessor size='1rem' className='inline-icon' />
          {'\u2009'}исходная конституента для данной конституенты – собственная конституента, прямым или опосредованным
          наследником которой является данная конституента.
        </li>
      </ul>

      <h2>Операционная схема синтеза</h2>
      <p>
        <IconOSS size='1rem' className='inline-icon' />
        {'\u2009'}
        <LinkTopic text='Операционная схема синтеза' topic={HelpTopic.CC_OSS} /> (ОСС) – система операций над
        концептуальными схемами.
      </p>
      <p>
        Граф синтеза – ориентированный граф, вершинами которого являются операции, а ребра указывают на использование
        результата одной операции как аргумента другой операции.
      </p>

      <h2>Операция</h2>
      <p>Операция – выделенная часть ОСС, определяющая способ получения КС в рамках ОСС.</p>
      <p>
        <IconConsolidation className='inline-icon' />
        {'\u2009'}Ромбовидный синтез – операция, где используются КС, имеющие общих предков.
      </p>

      <ul>
        По <b>способу получения КС выделены</b>:
        <li>
          <IconDownload size='1rem' className='inline-icon' />
          {'\u2009'}загрузка КС из библиотеки;
        </li>
        <li>
          <IconSynthesis size='1rem' className='inline-icon' />
          {'\u2009'}синтез концептуальных схем.
        </li>
      </ul>
    </div>
  );
}
