/** Russian UI copy for dialogs and toolbars. */
export const uiRu: Record<string, string> = {
  'ui.library.editor.openInLibrary': 'Открыть в библиотеке',
  'ui.library.editor.pathInheritedOss': 'Путь наследуется от ОСС',
  'ui.library.editor.ownerInheritedOss': 'Владелец наследуется от ОСС',
  'ui.library.pickLocation.explorerTitle': 'Проводник…',

  'ui.ai.prompt.editTemplateTitle': 'Редактировать шаблон',
  'ui.ai.prompt.copyResultTitle': 'Скопировать результат в буфер обмена',

  'ui.dlg.cstTemplate.header': 'Создание конституенты из шаблона',
  'ui.dlg.cstTemplate.tabTemplate.title': 'Выбор шаблона выражения',
  'ui.dlg.cstTemplate.tabArgs.title': 'Подстановка аргументов шаблона',

  'ui.dlg.createVersion.onlySelected': 'Только выбранные конституенты [{n} из {total}]',

  'ui.dlg.uploadRsform.loadMetadata': 'Загружать название и комментарий',
  'ui.dlg.uploadRsform.warningBody': 'При загрузке из файла все конституенты текущей КС будут удалены',

  'ui.oss.argumentPickLabel': 'Выбор аргументов: [ {count} ]',

  'ui.dlg.createBlock.tabChildren.title': 'Выбор вложенных узлов: [{count}]',

  'ui.placeholder.sourceSchema': 'Исходная схема',
  'ui.placeholder.targetSchema': 'Целевая схема',
  'ui.title.relocationDirection': 'Направление перемещения',

  'ui.dlg.editCst.titleDetailedEdit': 'Детальное редактирование',
  'ui.dlg.editCst.titleGoToAncestor': 'Перейти к предку',

  'ui.label.attributingConstituents': 'Атрибутирующие конституенты',

  'ui.tab.inlineSynthesis.schemaTitle': 'Источник конституент',
  'ui.tab.inlineSynthesis.selectSchemaFirst': 'Выберите схему',
  'ui.tab.inlineSynthesis.constituentsTitle': 'Перечень конституент',
  'ui.tab.inlineSynthesis.substitutionsTitle': 'Таблица отождествлений',
  'ui.placeholder.schemaNotSelected': 'Схема не выбрана',

  'ui.validation.termEmpty': 'Пустой термин',
  'ui.validation.termHomonyms': 'Термин совпадает с конституентами: {aliases}',
  'ui.placeholder.expressionMissing': 'Выражение отсутствует',
  'ui.placeholder.termMissing': 'Термин отсутствует',
  'ui.placeholder.definitionMissing': 'Определение отсутствует',

  'ui.dlg.createSynthesis.header': 'Создание операции синтеза',
  'ui.tab.oss.passportTitle': 'Текстовые поля',
  'ui.tab.oss.operationArgumentsTitle': 'Выбор аргументов операции',

  'ui.dlg.changeLocation.invalidHint':
    'Допустимы буквы, цифры, подчерк, пробел и "!". Сегмент пути не может начинаться и заканчиваться пробелом. Общая длина (с корнем) не должна превышать {maxLen}',

  'ui.aria.copyLinkToClipboard': 'Скопировать ссылку в буфер обмена',
  'ui.action.openInSandbox': 'Открыть в песочнице',

  'ui.sandbox.saveToFileHint': 'Скачать текущие данные песочницы в JSON',
  'ui.sandbox.loadFromFileHint': 'Загрузить данные песочницы из JSON',
  'ui.sandbox.createSchemaHint': 'Создать новую концептуальную схему из текущих данных песочницы',
  'ui.sandbox.createModelHint': 'Создать новую концептуальную схему и модель из текущих данных песочницы',
  'ui.sandbox.resetStateHint': 'Восстановить стартовые данные песочницы',

  'ui.substitution.acceptSuggestion': 'Принять предложение',
  'ui.substitution.ignoreSuggestion': 'Игнорировать предложение',
  'ui.substitution.replaceRight': 'Заменить правую',
  'ui.substitution.replaceLeft': 'Заменить левую',
  'ui.substitution.addToTable': 'Добавить в таблицу отождествлений',
  'ui.substitution.tableEmptyHint': 'Добавьте отождествление',

  'ui.ai.deleteTemplate': 'Удалить шаблон',

  'ui.cst.crucialRemoveTitle': 'Снять статус ключевой',
  'ui.cst.crucialAddTitle': 'Добавить статус ключевой',
  'ui.cst.crucialBadgeOn': 'ключевая',
  'ui.cst.crucialBadgeOff': 'обычная',

  'ui.cst.gotoSourceInOss': 'Перейти к исходной конституенте в ОСС',
  'ui.cst.noPredecessor': 'Конституента не имеет предка',
  'ui.rsmodel.calculateCurrentCst': 'Вычислить текущую конституенту',

  'ui.oss.menu.selectOriginal': 'Выделить оригинал',
  'ui.oss.menu.cloneResultSchemaTitle': 'Создать и загрузить копию концептуальной схемы',

  'ui.versioning.cannotRevertOss': 'Невозможно откатить КС,\nприкрепленную к операционной схеме',
  'ui.versioning.revertToVersion': 'Откатить к версии',
  'ui.versioning.switchToStaleVersion': 'Переключитесь на\nнеактуальную версию',
  'ui.versioning.revertSelectedAria': 'Откатить к выбранной версии',
  'ui.versioning.switchToLatestVersion': 'Переключитесь\nна актуальную версию',
  'ui.versioning.switchLatestAria': 'Переключить на актуальную версию'
};
