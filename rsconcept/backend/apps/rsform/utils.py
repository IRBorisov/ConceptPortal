''' Utility functions '''
import re

# Name for JSON inside Exteor files archive
EXTEOR_INNER_FILENAME = 'document.json'

# Old style reference pattern
_REF_OLD_PATTERN = re.compile(r'@{([^0-9\-][^\}\|\{]*?)\|([^\}\|\{]*?)\|([^\}\|\{]*?)}')
_RE_GLOBALS = r'[XCSADFPTN]\d+'  # cspell:disable-line
_REF_ENTITY_PATTERN = re.compile(r'@{([^0-9\-].*?)\|.*?}')
_GLOBAL_ID_PATTERN = re.compile(r'([XCSADFPTN][0-9]+)')  # cspell:disable-line


def apply_pattern(text: str, mapping: dict[str, str], pattern: re.Pattern[str]) -> str:
    ''' Apply mapping to matching in regular expression pattern subgroup 1 '''
    if text == '' or pattern == '':
        return text
    pos_input: int = 0
    output: str = ''
    for segment in re.finditer(pattern, text):
        entity = segment.group(1)
        if entity in mapping:
            output += text[pos_input: segment.start(1)]
            output += mapping[entity]
            output += text[segment.end(1): segment.end(0)]
            pos_input = segment.end(0)
    output += text[pos_input: len(text)]
    return output


def fix_old_references(text: str) -> str:
    ''' Fix reference format: @{X1|nomn|sing} -> {X1|nomn,sing} '''
    if text == '':
        return text
    pos_input: int = 0
    output: str = ''
    for segment in re.finditer(_REF_OLD_PATTERN, text):
        output += text[pos_input: segment.start(0)]
        output += f'@{{{segment.group(1)}|{segment.group(2)},{segment.group(3)}}}'
        pos_input = segment.end(0)
    output += text[pos_input: len(text)]
    return output


def filename_for_schema(alias: str) -> str:
    ''' Generate filename for schema from alias. '''
    if alias == '' or not alias.isascii():
        # Note: non-ascii symbols in Content-Disposition
        # are not supported by some browsers
        return 'Schema.trs'
    return alias + '.trs'


def extract_globals(expression: str) -> set[str]:
    ''' Extract all global aliases from expression. '''
    return set(re.findall(_RE_GLOBALS, expression))


def extract_entities(text: str) -> list[str]:
    ''' Extract list of entities that are referenced. '''
    result: list[str] = []
    for segment in re.finditer(_REF_ENTITY_PATTERN, text):
        entity = segment.group(1)
        if entity not in result:
            result.append(entity)
    return result


def replace_globals(expression: str, mapping: dict[str, str]) -> str:
    ''' Replace all global aliases in expression. '''
    return apply_pattern(expression, mapping, _GLOBAL_ID_PATTERN)


def replace_entities(expression: str, mapping: dict[str, str]) -> str:
    ''' Replace all entity references in expression. '''
    return apply_pattern(expression, mapping, _REF_ENTITY_PATTERN)
