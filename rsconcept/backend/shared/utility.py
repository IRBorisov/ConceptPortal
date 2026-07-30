''' Utility functions. '''
import json
from io import BytesIO
from typing import Optional
from zipfile import BadZipFile, ZipFile

# Hard cap on a single zip member used for TRS/document imports.
MAX_ZIP_MEMBER_BYTES = 5 * 1024 * 1024


class ZipMemberTooLarge(ValueError):
    ''' Raised when a zip member exceeds ``MAX_ZIP_MEMBER_BYTES``. '''


def read_zipped_json(
    data,
    json_filename: str,
    *,
    max_member_bytes: int = MAX_ZIP_MEMBER_BYTES
) -> Optional[dict]:
    ''' Read JSON from zipped data with a decompressed size cap. '''
    try:
        with ZipFile(data, 'r') as archive:
            try:
                info = archive.getinfo(json_filename)
            except KeyError:
                return None
            if info.file_size > max_member_bytes:
                raise ZipMemberTooLarge(
                    f'{json_filename} exceeds {max_member_bytes} bytes'
                )
            json_data = archive.read(json_filename)
            if len(json_data) > max_member_bytes:
                raise ZipMemberTooLarge(
                    f'{json_filename} exceeds {max_member_bytes} bytes'
                )
    except BadZipFile:
        return None
    result: dict = json.loads(json_data)
    return result


def write_zipped_json(json_data: dict, json_filename: str) -> bytes:
    ''' Write json JSON to bytes buffer '''
    content = BytesIO()
    data = json.dumps(json_data, indent=4, ensure_ascii=False)
    with ZipFile(content, 'w') as archive:
        archive.writestr(json_filename, data)
    return content.getvalue()
