import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpContributors() {
  return (
    <div>
      <h1>Благодарности разработчикам и исследователям</h1>
      <p>
        История инструментов работы с концептуальными схемами начинается с 1970-х годов и продолжается в настоящее
        время. Здесь представлена скромная попытка перечислить вклад различных людей в развитие инструментов и
        математического аппарата, лежащего в основе экспликации концептуальных схем.
      </p>
      <p>
        В списке указан год окончания работ над соответствующим результатом или год публикации соответствующей статьи.
        Курсивом выделены комментарии к значимости указанного результата.
      </p>
      <p>Добавления и корректировки приветствуются.</p>
      <ul className='flex flex-col gap-3'>
        <li>1973 Никаноров С.П., Персиц Д.Б. Формальное проектирование целостных СОУ.</li>
        <li>
          1975–1981 Никаноров С.П., Персиц Д.Б., Айзенштат А.В., Закс Б.А. Экспериментальная система пакетов прикладных
          программ автоматизированного проектирования систем организационного управления (АСП СОУ).
        </li>
        <li>1976 Поспелов Д.А., Чернышев С.Б. Метод построения формально-логической модели большой размерности.</li>
        <li>
          1977 Персиц Д.Б., Савелов Е.В., Тищенко А.В. Теоретические основы АСП СОУ,{' '}
          <i>
            сформировавшие базу для развития формализации предметных областей с помощью экспликации концептуальных схем.
          </i>
        </li>
        <li>
          1980 Никаноров С.П., Персиц Д.Б., Егоров Б.Б., Никитина Н.К., Ашихмин В.С., Астрина И.В., Тищенко А.В. Блок
          документирования в АСП СОУ.
        </li>
        <li>
          1986 Никаноров С.П., Кучкаров З.А., Никитина Н.К., Крюков И.А., Комаров В.Г. Система автоматизированного
          проектирования концептуального уровня баз данных (МАКС),{' '}
          <i>
            заложивший основу для хранения концептуальных схем в базах данных и ставший первым редактором
            родоструктурной экспликации в группе Никитиной.
          </i>
        </li>
        <li>
          1987 Иванов А.Ю., Кучкаров З.А. Разработка концептуальных и математических средств описания процессов принятия
          решений.
        </li>
        <li>
          1989 Остапов А.В., Кучкаров З.А. Методические вопросы концептуализации предметных областей,{' '}
          <i>
            как пример одной из работ Остапова, значительно расширившего технику экспликации и практику применения
            "бескванторных" выражений.
          </i>
        </li>
        <li>
          1990 Постников В.В., Никитина Н.К. Синтаксический анализатор текста рода структуры для МАКС,{' '}
          <i>являющийся первой попыткой реализовать автоматизированную проверку синтаксиса родов структур.</i>
        </li>
        <li>
          1993 Юдкин Ю.Ю., Костюк А.В., Никитина Н.К. Программа визуализации М-графов, представляющих родовую структуру.
        </li>
        <li>1993 Никитина Н.К., Чувашов Е.В. Система проектирования баз данных по их концептуальной модели.</li>
        <li>
          1993 Никаноров С.П., Кучкаров З.А., Остапов А.В., Шульпекин А.Н., Коваль А.Г., Костюк А.В. Программа
          операционализации текстов концептуальных моделей, эксплицированных в аппарате родов структур Экстеор 1,{' '}
          <i>ставший первым редактором родоструктурной экспликации в группе Кучкарова.</i>
        </li>
        <li>
          1993 Кучкаров З.А., Лавров В., Крайнев А., Шульпекин А.Н., Симонов М. Автоматический генератор
          PROLOG-программ, формирующих предметные интерпретации родоструктурных экспликаций Инттеор.
        </li>
        <li>
          1994 Ким В.Л., Кучкаров З.А. Разработка родоструктурных конструктов для библиотеки моделей и исследование
          возможностей их развития.
        </li>
        <li>
          1994 Воробей П.Н., Коваль А.Г. Редактор Программного комплекса Экстеор 1.5,{' '}
          <i>упростивший механизм печати экспликаций и улучшивший синтаксический анализ формального выражения.</i>
        </li>
        <li>
          1996 Коваль А.Г., Кучкаров З.А., Костюк А.В., Кононенко А.А., Син Ю.Е., Маклаков Ю.И. Программа
          родоструктурного синтеза операционализированных терминальных концептуальных моделей Экстеор 2,{' '}
          <i>ставшая первой версией реализации родоструктурного аппарата на C++ под Windows.</i>
        </li>

        <li>
          1996 Климишин В.В., Никаноров С.П., Никитина Н.К. Автоматизированная система "Библиотека концептуальных схем",{' '}
          <i>впервые определившая паспорт концептуальной схемы.</i>
        </li>
        <li>
          1997 Юрьев О.И., Никитина Н.К. Система поддержки процессов концептуального анализа и проектирования ПРОКСИМА
          1.
        </li>
        <li>
          1998 Гараева Ю.Р., Никитина Н.К. Синтаксический анализатор выражений на языке родоструктурной экспликации для
          ПРОКСИМА 1.
        </li>
        <li>
          1998 Син Ю.Е. Разработка и исследование класса теоретико-модельных операций для технологической линии
          концептуального проектирования.
        </li>
        <li>
          1999 Кононенко А.А., Кучкаров З.А. Программа преобразования родоструктурного синтеза операционализированных
          терминальных концептуальных моделей Экстеор 3,{' '}
          <i>впервые включившая операционную схему синтеза (дерево синтеза).</i>
        </li>
        <li>
          1999 Ландин Н.А., Никитина Н.К. Разработка автоматизированной подсистемы, реализующей операции отслоения и
          рассечения над концептуальными схемами.
        </li>
        <li>
          1999 Юрьев О.И., Зверев В.Ю. Разработка и создание экспериментальной версии автоматизированной системы
          "Библиотека проектов систем организационного управления".
        </li>
        <li>
          2000 Кучкаров З.А., Кононенко А.А., Син Ю.Е. Программа генерации концептуально определенной предметно
          интерпретированной сети организационных процедур Оргтеор,{' '}
          <i>
            позволившая строить процессные схемы по графу термов концептуальной схемы и впервые включившая модуль
            терминологических преобразований текстовых описаний.
          </i>
        </li>
        <li>
          2000 Майоров В.А., Кононенко А.А. Программа автоматизированной генерации структуры данных и их визуализации по
          концептуальной модели БДтеор,{' '}
          <i>
            определившая проблемы интерфейса наполнения концептуальной модели в сложных ступенях и предложившая
            библиотеку Kernel для удержания интерпретации с помощью М-графа.
          </i>
        </li>
        <li>2000 Тищенко А.В. Шкалы множеств и родов структур.</li>
        <li>
          2000 Тищенко А.В., Акименков А.М., Ключников А.В. Система операций над концептуальными схемами,
          представленными в родоструктурной форме.
        </li>
        <li>2000 Ключников А.В. Эквивалентность теорий родов структур.</li>
        <li>
          2001 Никитин А.В., Кучкаров З.А. Исследование и построение типологии изменений теоретико-множественных
          интерпретаций класса декартового произведения.
        </li>
        <li>
          2001 Майоров В.А., Кононенко А.А. Программа преобразования сети процедур из формата Оргтеор в формат BPWin
          (IDEF0).
        </li>
        <li>
          2001 Майоров В.А. Программа построения формального выражения путем выбора альтернатив Grammar,{' '}
          <i>предложившая альтернативной подход к построению корректных формальных выражений.</i>
        </li>
        <li>
          2004 Гараева Ю.Р., Пономарев И.Н. Семантико-синтаксический анализатор текстов родов структур Бурбакизатор,{' '}
          <i>
            впервые включивший полный грамматический анализ родов структур и проверку биективной переносимости
            выражения.
          </i>
        </li>
        <li>
          2003 Юдкин Ю.Ю., Кудюкин Д.А. Разработка и испытание компьютерной программы, формирующей
          теоретико-множественную интерпретацию терма частной родоструктурной теории.
        </li>

        <li>
          2004 Кононенко А.А. Генерация кода на языке программирования C++ по тексту концептуальной схемы,
          эксплицированной в родах структур.
        </li>
        <li>
          2004 Кононенко А.А., Кучкаров З.А., Никаноров С.П., Никитина Н.К. Технология концептуального проектирования,
          &mdash; <i>монография, собравшая исторический обзор и перспективы развития технологического направления.</i>
        </li>
        <li>2006 Кучкаров З.А., Никаноров С.П. Библиотека моделей.</li>
        <li>2006 Кучкаров З.А., Лавров В.А. Полные системы простых теоретико-множественных операций.</li>
        <li>
          2006 Солнцев С.В., Присакарь С.В. Введение количественных отношений в методологию концептуального анализа и
          проектирования, в том числе в язык родоструктурной экспликации.
        </li>
        <li>
          2007 Пономарев И.Н. Учебное пособие: Введение в математическую логику и роды структур,{' '}
          <i>
            являющееся наиболее полным описанием теории родов структур, используемой в родоструктурных экспликациях.
          </i>
        </li>
        <li>
          2008 Пономарев И.Н. Об эквивалентной представимости рода структуры с помощью заданной типовой характеристики.
        </li>
        <li>
          2010 Грязнов А.Д., Кононенко А.А. Исследование и построение транслятора концептуальной схемы в концептуальную
          модель.
        </li>
        <li>2010 Никаноров С.П. Введение в аппарат ступеней.</li>
        <li>
          2012 Елисов Д.Н., Кононенко А.А. Использование механизма XSD-схем для хранения и операционализации
          концептуальных схем и концептуальных моделей с помощью XML.
        </li>
        <li>
          2013 Борисов И.Р., Кононенко А.А. Исследование, разработка и экспериментальная программная реализация операций
          над концептуальными моделями,{' '}
          <i>
            впервые реализовавшая модуль прямого вычисления интерпретации формального выражения, встроенный в Экстеор
            3.5.
          </i>
        </li>
        <li>2013 Липатов А.А., Пономарев И.Н. Операции над родами структур и пример автоматизации их выполнения.</li>
        <li>
          2014 Баширов Р.М., Борисов И.Р. Исследования и программная реализации оптимальной структуры данных для
          вычисления интерпретации концептуальных схем.
        </li>
        <li>
          2014 Борисов И.Р. Программный комплекс Экстеор 4,{' '}
          <i>
            включавший доработанный модуль операционного синтеза и синтаксический анализатор на базе грамматики,
            предложенной Пономаревым И.Н.
          </i>
        </li>
        <li>
          2014 Борисов И.Р. Концептуальные конструкции в задаче синтеза систем на примере Экологического кодекса,
          &mdash;{' '}
          <i>
            статья, вводящая понятие концептуальных конструкций как промежуточных форм для операционализации
            концептуальных схем.
          </i>
        </li>
        <li>2015 Иванов А.Ю. Аппарат ступеней С.П. Никанорова и возможное развитие идей по его использованию.</li>
        <li>
          2016 Баширов Р.М., Борисов И.Р. Исследование области компьютерной лингвистики и разработка модулей
          терминологического контроля в Экстеор 4 и Microsoft Office Word,{' '}
          <i>
            являющееся основой библиотеки <TextURL text='cctext' href={external_urls.git_cctext} />.
          </i>
        </li>
        <li>
          2016 Борисов И.Р. Программный комплекс Экстеор 4.5,{' '}
          <i>
            включавший текстовый модуль и полностью переработанное ядро, выделенное в отдельную библиотеку (впоследствии
            &mdash; <TextURL text='ConceptCore' href={external_urls.git_core} />
            ).
          </i>
        </li>
        <li>
          2017 Иванов А.Ю. Введение в технологию концептуализации предметных областей социологии: основы полагания ядра
          теории (на примере родственных отношений).
        </li>
        <li>
          2017 Мурадов А.К., Борисов И.Р. Организация операций над системами понятий посредством графических
          интерфейсов, <i>заложивший основу для технологии Концепт.Блоки и блока графического синтеза.</i>
        </li>
        <li>
          2018 Князев А.В., Борисов И.Р. Изучение методов концептуальной расчистки, разметки текстов и разработка
          программных средств их автоматизации,{' '}
          <i> &mdash; диплом, сформировавший основу для технологий Концепт.Разметка и Концепт.Майнинг.</i>
        </li>
        <li>
          2018 Болотин П.В., Никитин А.В. Исследование типологии изменения теоретико-множественной интерпретации класса
          множества подмножеств.
        </li>
        <li>
          2019 Широкова Л.Р., Борисов И.Р. Исследование возможностей применения методов машинного обучения для решения
          задач расчистки текстов. Разработка прототипа программного модуля, &mdash;{' '}
          <i>первая попытка внедрения технологий ИИ в текстовый модуль.</i>
        </li>
        <li>
          2020 Пакулина Т.А., Борисов И.Р. Исследование применения методов машинного обучения для выделения именованных
          сущностей в текстах интервью. Экспериментальная разработка программного модуля расчистки текстов,{' '}
          <i>ставшего расширением технологии Концепт.Расчистка.</i>
        </li>
        <li>
          2020 Программный комплекс Экстеор 4.7, включающий значительное расширение выразительных средств языка родов
          структур (рекурсивные и императивные выражения, фильтры, ASCII синтаксис).
        </li>
        <li>
          2021 Демешко А.Б., Борисов И.Р. Исследование и разработка программного модуля формирования текстов функций на
          основе концепта функциональная структура,{' '}
          <i>дополнившего текстовый модуль возможностью работы с глагольными формами.</i>
        </li>
        <li>
          2023 Тулисов А.В., Борисов И.Р. Разработка инструмента экспликации концептуальных схем в родоструктурной форме
          через веб-интерфейс, &mdash; <i>разработка прототипа интерфейса КонцептПортал.</i>
        </li>
        <li>
          2024 Борисов И.Р. Программный комплекс <LinkTopic text='Экстеор 4.9' topic={HelpTopic.EXTEOR} />,
          поддерживающий работу со схемами, выгруженными из КонцептПортал.{' '}
          <i>
            Функционал ConceptCore (С++) стал доступен в Python через обертку{' '}
            <TextURL text='pyconcept' href={external_urls.git_core} />.
          </i>
        </li>
        <li>
          2024 Хаданович Б.А., Борисов И.Р. Исследование механизмов проведения сквозных изменений в операционной схеме
          синтеза. Разработка прототипа веб-интерфейса синтеза концептуальных схем.
          <i> Прототип графического интерфейса для синтеза концептуальных схем.</i>
        </li>
        <li>
          2024 Викентьев М.И., Борисов И.Р. Исследование использования современных web-интерфейсов для визуализации
          отношений для применения в рамках концептуального синтеза.{' '}
          <i> Визуализации смешанных представлений концептуальной схемы.</i>
        </li>
      </ul>
    </div>
  );
}
