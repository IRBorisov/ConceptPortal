/**
 * Module: Text descriptors for UI and model elements.
 *
 * Label is a short text used to represent an entity.
 * Description is a long description used in tooltips.
 */

/**
 * UI info descriptors.
 */
export const infoMsg = {
  changesSaved: 'Изменения сохранены',

  pathReady: 'Путь скопирован',
  substituteSingle: 'Отождествление завершено',
  reorderComplete: 'Упорядочение завершено',
  reindexComplete: 'Имена конституент обновлены',
  moveComplete: 'Перемещение завершено',
  linkReady: 'Ссылка скопирована',
  promptReady: 'Текст скопирован',
  versionRestored: 'Загрузка версии завершена',
  locationRenamed: 'Ваши схемы перемещены',
  cloneComplete: (alias: string) => `Копия создана: ${alias}`,
  noDataToExport: 'Нет данных для экспорта',
  substitutionsCorrect: 'Таблица отождествлений прошла проверку',
  uploadSuccess: 'Схема загружена из файла',
  inlineSynthesisComplete: 'Встраивание завершено',
  moveSuccess: 'Перемещение завершено',

  newLibraryItem: 'Схема успешно создана',
  addedConstituents: (count: number) => `Добавлены конституенты: ${count}`,
  newUser: (username: string) => `Пользователь успешно создан: ${username}`,
  newVersion: (version: string) => `Версия создана: ${version}`,
  newConstituent: (alias: string) => `Конституента добавлена: ${alias}`,
  newOperation: (alias: string) => `Операция добавлена: ${alias}`,

  versionDestroyed: 'Версия удалена',
  itemDestroyed: 'Схема удалена',
  operationDestroyed: 'Операция удалена',
  blockDestroyed: 'Блок удален',
  operationExecuted: 'Операция выполнена',
  allOperationExecuted: 'Все операции выполнены',
  constituentsDestroyed: (count: number) => `Конституенты удалены: ${count}`
};

/**
 * UI error descriptors.
 */
export const errorMsg = {
  astFailed: 'Невозможно построить дерево разбора',
  typeStructureFailed: 'Структура отсутствует',
  passwordsMismatch: 'Пароли не совпадают',
  passwordsSame: 'Пароль совпадает со старым',
  imageFailed: 'Ошибка при создании изображения',
  reuseOriginal: 'Повторное использование удаляемой конституенты при отождествлении',
  substituteInherited: 'Нельзя удалять наследованные конституенты при отождествлении',
  inputAlreadyExists: 'Концептуальная схема с таким именем уже существует',
  requiredField: 'Обязательное поле',
  emailField: 'Введите корректный адрес электронной почты',
  rulesNotAccepted: 'Примите условия пользования Порталом',
  privacyNotAccepted: 'Примите политику обработки персональных данных',
  loginFormat: 'Имя пользователя должно содержать только буквы и цифры',
  invalidLocation: 'Некорректный формат пути',
  versionTaken: 'Версия с таким шифром уже существует',
  emptySubstitutions: 'Выберите хотя бы одно отождествление',
  aliasInvalid: 'Введите незанятое имя, соответствующее типу',
  invalidResponse: 'Некорректный ответ сервера'
};

/**
 * UI tooltip descriptors.
 */
export const tooltipText = {
  unsaved: 'Сохраните или отмените изменения',
  shareItem: (isPublic: boolean) => (isPublic ? 'Поделиться схемой' : 'Поделиться можно только <br/>открытой схемой')
};

/**
 * UI prompt messages.
 */
export const promptText = {
  promptUnsaved: 'Присутствуют несохраненные изменения. Продолжить без их учета?',
  deleteLibraryItem: 'Вы уверены, что хотите удалить данную схему?',
  deleteBlock: 'Вы уверены, что хотите удалить данный блок?',
  deleteOSS:
    'Внимание!!\nУдаление операционной схемы приведет к удалению всех операций и собственных концептуальных схем.\nДанное действие нельзя отменить.\nВы уверены, что хотите удалить данную ОСС?',
  generateWordforms: 'Данное действие приведет к перезаписи словоформ при совпадении граммем. Продолжить?',
  restoreArchive: 'При восстановлении архивной версии актуальная схему будет заменена. Продолжить?',
  ownerChange:
    'Вы уверены, что хотите изменить владельца? Вы потеряете право управления данной схемой. Данное действие отменить нельзя'
};
