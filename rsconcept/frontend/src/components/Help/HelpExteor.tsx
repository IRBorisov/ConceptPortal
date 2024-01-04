import TextURL from '@/components/ui/TextURL';
import { urls } from '@/utils/constants';

function HelpExteor() {
  // prettier-ignore
  return (
  <div>
    <h1>Экстеор</h1>
    <p>Экстеор 4.9 — редактор текстов систем понятий эксплицированных в родах структур, используемых для создания проектов систем организационного управления. Экстеор является идейным предком Портала.</p>
    <p>Портал превосходит Экстеор в части редактирования экспликаций, но функции синтеза и вычисления интерпретации пока доступны только в Экстеоре. Также следует использовать Экстеор для выгрузки экспликаций в Word для последующей печати.</p>
    <p>Экстеор доступен на операционной системы Windows 10 и выше.</p>
    <p>Скачать установщик: <TextURL href={urls.exteor64} text='64bit'/> | <TextURL href={urls.exteor32} text='32bit'/></p>
    <p className='mt-2'><b>Основные функции</b></p>
    <li>Работа с РС-формой системы понятий.</li>
    <li>Автоматическое определение типизации выражений языка родов структур.</li>
    <li>Проверка корректности РС-формы.</li>
    <li>Контекстный поиск с учетом словоформ терминов.</li>
    <li>Терминологический контроль вхождений терминов в тексты других терминов и текстовые определения.</li>
    <li>Автоматическое выполнение операций синтеза РС-форм.</li>
    <li>Синтез РС-форм с помощью операционной схемы синтеза (ОСС).</li>
    <li>Автоматическое сквозное внесение изменений в ОСС (пересинтез).</li>
    <li>Вычисление объектной интерпретации для производных понятий для заданных интерпретаций базовых понятий.</li>
    <li>Выгрузка концептуальных схем в Word.</li>
    <li>Импорт/экспорт данных объектных интерпретаций из/в Excel.</li>
  </div>);
}

export default HelpExteor;
