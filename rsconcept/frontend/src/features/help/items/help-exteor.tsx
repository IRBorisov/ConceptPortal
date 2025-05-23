import { TextURL } from '@/components/control';
import { external_urls, PARAMETER } from '@/utils/constants';

export function HelpExteor() {
  return (
    <div>
      <h1>Экстеор</h1>
      <p>Экстеор 4.9 — редактор текстов систем понятий эксплицированных в родах структур.</p>
      <p>
        Портал превосходит Экстеор в части редактирования экспликаций, но вычисление интерпретации доступно только в
        Экстеор. Также следует использовать Экстеор для выгрузки экспликаций в Word для последующей печати.
      </p>

      <p>
        Скачать установщик: <TextURL href={external_urls.exteor64} text='64bit' /> |{' '}
        <TextURL href={external_urls.exteor32} text='32bit' /> (Windows 10 и выше)
      </p>
      <p>
        Текущая версия: <b>{PARAMETER.exteorVersion}</b>
      </p>
      <p>
        Экстеор не поддерживает автоматическое обновление. Если в выгруженной схеме присутствуют неожиданные диагностики
        или ошибки, то попробуйте скачать новую версию по ссылкам выше.
      </p>

      <h2>Основные функции</h2>
      <ul>
        <li>Работа с РС-формой системы понятий</li>
        <li>Автоматическое определение типизации выражений</li>
        <li>Проверка корректности РС-формы</li>
        <li>Контекстный поиск с учетом словоформ терминов</li>
        <li>Терминологический контроль вхождений терминов</li>
        <li>Автоматическое выполнение операций синтеза РС-форм</li>
        <li>Синтез с помощью операционной схемы синтеза (ОСС)</li>
        <li>Автоматическое сквозное внесение изменений в ОСС</li>
        <li>Вычисление объектной интерпретации</li>
        <li>Выгрузка концептуальных схем в Word</li>
        <li>Импорт/экспорт интерпретаций через Excel</li>
      </ul>
    </div>
  );
}
