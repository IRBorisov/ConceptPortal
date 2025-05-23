export function HelpRSLangTemplates() {
  return (
    <div>
      <h1>Шаблоны</h1>
      <p>
        Портал предоставляет быстрый доступ к часто используемым выражениям с помощью функции создания конституенты из
        шаблона
      </p>
      <p>
        Источником шаблонов является <b>Банк выражений</b>, содержащий параметризованные понятия и утверждения,
        сгруппированные по разделам
      </p>
      <ul>
        <li>Сначала выбирается шаблон выражения (вкладка Шаблон)</li>
        <li>
          Далее для аргументов можно зафиксировать значения, выбрав из конституент текущей схемы или указав выражения
          (вкладка Аргументы)
        </li>
        <li>Значения аргументов будут подставлены в выражение, включая корректировку перечня аргументов</li>
        <li>Если значения указаны для всех аргументов, то тип создаваемой конституенты будет автоматически обновлён</li>
        <li>На вкладке Конституента можно скорректировать все атрибуты, создаваемой конституенты</li>
        <li>
          Кнопка <b>Создать</b> инициирует добавление выбранной конституенты в схему
        </li>
      </ul>
    </div>
  );
}
