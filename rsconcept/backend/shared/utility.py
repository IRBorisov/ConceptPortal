''' Utility functions. '''
import json
from io import BytesIO
from typing import Optional
from zipfile import BadZipFile, ZipFile


def read_zipped_json(data, json_filename: str) -> Optional[dict]:
    ''' Read JSON from zipped data. '''
    try:
        with ZipFile(data, 'r') as archive:
            json_data = archive.read(json_filename)
    except BadZipFile:
        return None
    result: dict = json.loads(json_data)
    return result


def write_zipped_json(json_data: dict, json_filename: str) -> bytes:
    ''' Write json JSON to bytes buffer '''
    content = BytesIO()
    data = json.dumps(json_data, indent=4, ensure_ascii=False)
    with ZipFile(content, 'w') as archive:
        archive.writestr(json_filename, data=data)
    return content.getvalue()
