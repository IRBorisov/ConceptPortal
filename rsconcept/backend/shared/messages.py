''' Utility: Text messages. '''
# pylint: skip-file


def fieldNotAllowed() -> str:
    return 'Недопустимое поле'


def constituentsInvalid(constituents: list[int]) -> str:
    return f'некорректные конституенты для схемы: {constituents}'


def associationSelf() -> str:
    return 'Рефлексивная ассоциация не допускается'


def associationAlreadyExists() -> str:
    return 'Отношение уже существует'


def constituentaNotInRSform(title: str) -> str:
    return f'Конституента не принадлежит схеме: {title}'


def changeInheritedDefinition() -> str:
    return 'Нельзя изменить определение наследника'


def constituentaNotFromOperation() -> str:
    return 'Конституента не соответствую аргументам операции'


def operationNotInOSS() -> str:
    return 'Операция не принадлежит ОСС'


def operationResultNotInOSS() -> str:
    return 'Результат операции не принадлежит ОСС'


def duplicateSchemasInArguments() -> str:
    return 'Аргументы не должны содержать повторяющиеся КС'


def blockNotInOSS() -> str:
    return 'Блок не принадлежит ОСС'


def parentNotInOSS() -> str:
    return 'Родительский блок не принадлежит ОСС'


def blockCyclicHierarchy() -> str:
    return 'Попытка создания циклического вложения'


def childNotInOSS() -> str:
    return 'Дочерний элемент блок не принадлежит ОСС'


def missingArguments() -> str:
    return 'Операция не содержит аргументов, при этом содержит отождествления'


def exteorFileCorrupted() -> str:
    return 'Файл Экстеор не соответствует ожидаемому формату. Попробуйте сохранить файл в новой версии'


def importIntoInherited() -> str:
    return 'Нельзя импортировать в синтезированную КС'


def previousResultMissing() -> str:
    return 'Отсутствует результат предыдущей операции'


def substitutionNotInList() -> str:
    return 'Отождествляемая конституента отсутствует в списке'


def schemaForbidden() -> str:
    return 'Нет доступа к схеме'


def operationNotInput(title: str) -> str:
    return f'Операция не является Загрузкой: {title}'


def operationHasArguments(title: str) -> str:
    return f'Операция имеет аргументы: {title}'


def operationResultFromAnotherOSS() -> str:
    return 'Схема является результатом другой ОСС'


def schemasNotConnected() -> str:
    return 'Концептуальные схемы не связаны через ОСС'


def sourceEqualDestination() -> str:
    return 'Схема-источник и схема-получатель не могут быть одинаковыми'


def RelocatingInherited() -> str:
    return 'Невозможно переместить наследуемые конституенты'


def operationInputAlreadyConnected() -> str:
    return 'Схема уже подключена к другой операции'


def replicaNotAllowed() -> str:
    return 'Реплики не поддерживаются'


def replicaRequired() -> str:
    return 'Операция должна быть репликацией'


def operationNotSynthesis(title: str) -> str:
    return f'Операция не является Синтезом: {title}'


def operationResultEmpty(title: str) -> str:
    return f'Результат операции пуст: {title}'


def operationResultNotEmpty(title: str) -> str:
    return f'Результат операции не пуст: {title}'


def renameTrivial(name: str) -> str:
    return f'Имя должно отличаться от текущего: {name}'


def substituteTrivial(name: str) -> str:
    return f'Отождествление конституенты с собой не корректно: {name}'


def substituteDouble(name: str) -> str:
    return f'Повторное отождествление: {name}'


def aliasTaken(name: str) -> str:
    return f'Имя уже используется: {name}'


def aliasInvalidFormat(name: str) -> str:
    return f'Некорректное имя конституенты: {name}'


def aliasDuplicate(name: str) -> str:
    return f'Повторяющееся имя конституенты: {name}'


def invalidLocation() -> str:
    return f'Некорректная строка расположения'


def invalidEnum(value: str) -> str:
    return f'Неподдерживаемое значение параметра: {value}'


def typificationInvalidStr() -> str:
    return 'Invalid typification string'


def missingAttribution() -> str:
    return f'Атрибутирование не найдено'


def deleteInheritedAttribution() -> str:
    return f'Попытка удалить наследованное атрибутирование'


def createdInheritedAttribution() -> str:
    return f'Попытка установить атрибутирование между наследниками из одной КС'


def exteorFileVersionNotSupported() -> str:
    return 'Некорректный формат файла Экстеор. Сохраните файл в новой версии'


def constituentaNoStructure() -> str:
    return 'Указанная конституента не обладает теоретико-множественной типизацией'


def missingFile() -> str:
    return 'Отсутствует прикрепленный файл'


def passwordAuthFailed() -> str:
    return 'Неизвестное сочетание имени пользователя (email) и пароля'


def passwordsNotMatch() -> str:
    return 'Введенные пароли не совпадают'


def emailAlreadyTaken() -> str:
    return 'Пользователь с данным email уже существует'


def promptLabelTaken(label: str) -> str:
    return f'Шаблон с меткой "{label}" уже существует у пользователя.'


def promptNotOwner() -> str:
    return 'Вы не являетесь владельцем этого шаблона.'


def promptSharedPermissionDenied() -> str:
    return 'Только администратор может сделать шаблон общедоступным.'


def promptNotFound() -> str:
    return 'Шаблон не найден.'
