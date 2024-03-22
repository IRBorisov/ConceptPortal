''' Utility: Text messages. '''
# pylint: skip-file

def constituentaNotOwned(title: str):
    return f'Конституента не принадлежит схеме: {title}'

def renameTrivial(name: str):
    return f'Имя должно отличаться от текущего: {name}'

def substituteTrivial(name: str):
    return f'Отождествление конституенты с собой не корректно: {name}'

def aliasTaken(name: str):
    return f'Имя уже используется: {name}'

def pyconceptFailure():
    return 'Invalid data response from pyconcept'

def typificationInvalidStr():
    return 'Invalid typification string'

def libraryTypeUnexpected():
    return 'Attempting to use invalid adaptor for non-RSForm item'

def exteorFileVersionNotSupported():
    return 'Некорректный формат файла Экстеор. Сохраните файл в новой версии'

def invalidPosition():
    return 'Invalid position: should be positive integer'

def constituentaNoStructure():
    return 'Указанная конституента не обладает теоретико-множественной типизацией'
