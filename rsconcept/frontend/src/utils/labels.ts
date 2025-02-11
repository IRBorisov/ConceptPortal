/**
 * Module: Text descriptors for UI and model elements.
 *
 * Label is a short text used to represent an entity.
 * Description is a long description used in tooltips.
 */
import { AccessPolicy, LibraryItemType } from '@/features/library/models/library';
import { UserRole } from '@/features/users/models/user';

/**
 * Retrieves label for {@link UserRole}.
 */
export function labelAccessMode(mode: UserRole): string {
  // prettier-ignore
  switch (mode) {
    case UserRole.READER:     return 'Читатель';
    case UserRole.EDITOR:     return 'Редактор';
    case UserRole.OWNER:      return 'Владелец';
    case UserRole.ADMIN:      return 'Администратор';
  }
}

/**
 * Retrieves description for {@link UserRole}.
 */
export function describeAccessMode(mode: UserRole): string {
  // prettier-ignore
  switch (mode) {
    case UserRole.READER:
      return 'Режим запрещает редактирование';
    case UserRole.EDITOR:
      return 'Режим редактирования';
    case UserRole.OWNER:
      return 'Режим владельца';
    case UserRole.ADMIN:
      return 'Режим администратора';
  }
}

/**
 * Retrieves label for {@link AccessPolicy}.
 */
export function labelAccessPolicy(policy: AccessPolicy): string {
  // prettier-ignore
  switch (policy) {
    case AccessPolicy.PRIVATE:     return 'Личный';
    case AccessPolicy.PROTECTED:   return 'Защищенный';
    case AccessPolicy.PUBLIC:      return 'Открытый';
  }
}

/**
 * Retrieves description for {@link AccessPolicy}.
 */
export function describeAccessPolicy(policy: AccessPolicy): string {
  // prettier-ignore
  switch (policy) {
    case AccessPolicy.PRIVATE:
      return 'Доступ только для владельца';
    case AccessPolicy.PROTECTED:
      return 'Доступ для владельца и редакторов';
    case AccessPolicy.PUBLIC:
      return 'Открытый доступ';
  }
}

/**
 * Retrieves label for {@link LibraryItemType}.
 */
export function labelLibraryItemType(itemType: LibraryItemType): string {
  // prettier-ignore
  switch (itemType) {
    case LibraryItemType.RSFORM:  return 'КС';
    case LibraryItemType.OSS:     return 'ОСС';
  }
}

/**
 * Retrieves description for {@link LibraryItemType}.
 */
export function describeLibraryItemType(itemType: LibraryItemType): string {
  // prettier-ignore
  switch (itemType) {
    case LibraryItemType.RSFORM:  return 'Концептуальная схема';
    case LibraryItemType.OSS:     return 'Операционная схема синтеза';
  }
}

/**
 * UI info descriptors.
 */
export const information = {
  changesSaved: 'Изменения сохранены',

  pathReady: 'Путь скопирован',
  substituteSingle: 'Отождествление завершено',
  reorderComplete: 'Упорядочение завершено',
  reindexComplete: 'Имена конституент обновлены',
  moveComplete: 'Перемещение завершено',
  linkReady: 'Ссылка скопирована',
  versionRestored: 'Загрузка версии завершена',
  locationRenamed: 'Ваши схемы перемещены',
  cloneComplete: (alias: string) => `Копия создана: ${alias}`,
  noDataToExport: 'Нет данных для экспорта',
  substitutionsCorrect: 'Таблица отождествлений прошла проверку',
  uploadSuccess: 'Схема загружена из файла',
  inlineSynthesisComplete: 'Встраивание завершено',

  newLibraryItem: 'Схема успешно создана',
  addedConstituents: (count: number) => `Добавлены конституенты: ${count}`,
  newUser: (username: string) => `Пользователь успешно создан: ${username}`,
  newVersion: (version: string) => `Версия создана: ${version}`,
  newConstituent: (alias: string) => `Конституента добавлена: ${alias}`,
  newOperation: (alias: string) => `Операция добавлена: ${alias}`,

  versionDestroyed: 'Версия удалена',
  itemDestroyed: 'Схема удалена',
  operationDestroyed: 'Операция удалена',
  operationExecuted: 'Операция выполнена',
  allOperationExecuted: 'Все операции выполнены',
  constituentsDestroyed: (count: number) => `Конституенты удалены: ${count}`
};

/**
 * UI error descriptors.
 */
export const errors = {
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
  versionTaken: 'Версия с таким шифром уже существует'
};

/**
 * UI tooltip descriptors.
 */
export const tooltips = {
  unsaved: 'Сохраните или отмените изменения',
  shareItem: (policy?: AccessPolicy) =>
    policy === AccessPolicy.PUBLIC ? 'Поделиться схемой' : 'Поделиться можно только <br/>открытой схемой'
};

/**
 * UI prompt messages.
 */
export const prompts = {
  promptUnsaved: 'Присутствуют несохраненные изменения. Продолжить без их учета?',
  deleteLibraryItem: 'Вы уверены, что хотите удалить данную схему?',
  deleteOSS:
    'Внимание!!\nУдаление операционной схемы приведет к удалению всех операций и собственных концептуальных схем.\nДанное действие нельзя отменить.\nВы уверены, что хотите удалить данную ОСС?',
  generateWordforms: 'Данное действие приведет к перезаписи словоформ при совпадении граммем. Продолжить?',
  restoreArchive: 'При восстановлении архивной версии актуальная схему будет заменена. Продолжить?',
  templateUndefined: 'Вы уверены, что хотите создать шаблонную конституенту не фиксируя аргументы?',
  ownerChange:
    'Вы уверены, что хотите изменить владельца? Вы потеряете право управления данной схемой. Данное действие отменить нельзя'
};

// ============== INTERNAL LABELS FOR DEVELOPERS TEXT ================
export function contextOutsideScope(contextName: string, contextState: string): string {
  return `${contextName} has to be used within <${contextState}>`;
}
