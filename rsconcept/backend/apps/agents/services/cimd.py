''' Discover public OAuth client metadata over a bounded HTTPS request. '''
import hashlib
import json
import re
import socket
import subprocess
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from email.parser import BytesHeaderParser
from ipaddress import ip_address, ip_network
from threading import BoundedSemaphore
from urllib.parse import unquote, urlsplit

from django.core.cache import caches

from .mcp_oauth import safe_url

MAX_CLIENT_URI = 2048
MAX_DOCUMENT = 16 * 1024
MAX_RESPONSE = MAX_DOCUMENT + 16 * 1024
MAX_CACHE_SECONDS = 300
_DNS_WORKERS = ThreadPoolExecutor(max_workers=2, thread_name_prefix='cimd-dns')
_DNS_SLOTS = BoundedSemaphore(2)
_DNS_LABEL = r'[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?'
_DNS_NAME = re.compile(rf'(?:{_DNS_LABEL}\.)+[a-z](?:[a-z0-9-]{{0,61}}[a-z0-9])?')
_LOOPBACK = re.compile(r'(http://(?:127\.0\.0\.1|localhost|\[::1\]))(?::[0-9]+)?([/?].*)?')

# Addresses used for special services or transition mechanisms may be marked global by ipaddress.
_SPECIAL_NETWORKS = tuple(map(ip_network, (
    '192.0.0.0/24', '192.31.196.0/24', '192.52.193.0/24', '192.88.99.0/24', '192.175.48.0/24',
    '2001::/23', '2002::/16', '2620:4f:8000::/48', '3fff::/20',
)))
_IPV6_UNICAST = ip_network('2000::/3')


class InvalidMetadata(ValueError):
    ''' Client URI, network destination or document violates the discovery policy. '''


class MetadataUnavailable(Exception):
    ''' The metadata origin could not be reached or did not complete the response. '''


@dataclass(frozen=True)
class ClientMetadata:
    ''' Only the client metadata needed by the authorization flow. '''

    name: str
    redirect_uris: tuple[str, ...]

    def accepts_redirect(self, uri: str) -> bool:
        ''' HTTPS callbacks match exactly. Native loopback callbacks can change ports. '''
        key = _redirect_key(uri)
        return any(key == _redirect_key(registered) for registered in self.redirect_uris)

    def consent_digest(self, redirect_uri: str) -> str:
        ''' Reuse consent only for unchanged client metadata and the same callback. '''
        metadata = [self.name, sorted(self.redirect_uris), _redirect_key(redirect_uri)]
        return hashlib.sha256(json.dumps(metadata, separators=(',', ':')).encode()).hexdigest()


def _redirect_key(uri: str) -> str:
    match = _LOOPBACK.fullmatch(uri)
    return match[1] + (match[2] or '') if match else uri


def valid_redirect(uri) -> bool:
    ''' Accept the HTTPS and loopback callback forms supported by Portal. '''
    return (isinstance(uri, str) and len(uri) <= MAX_CLIENT_URI and bool(re.fullmatch(r'[!-~]+', uri))
            and '#' not in uri and safe_url(uri))


def client_identifier(value: str):
    ''' Parse an RFC-style HTTPS identifier without accepting alternate host spellings. '''
    if len(value) > MAX_CLIENT_URI or not re.fullmatch(r'[!-~]+', value) or '#' in value or not safe_url(value):
        raise InvalidMetadata()
    url = urlsplit(value)
    if (url.scheme != 'https' or not url.hostname or url.path in ('', '/')
            or any(unquote(segment) in ('.', '..') for segment in url.path.split('/'))):
        raise InvalidMetadata()
    bare_host = f'[{url.hostname}]' if ':' in url.hostname else url.hostname
    if not re.fullmatch(re.escape(bare_host) + r'(?::[0-9]+)?', url.netloc, re.IGNORECASE):
        raise InvalidMetadata()
    try:
        ip_address(url.hostname)
    except ValueError as error:
        if len(url.hostname) > 253 or not _DNS_NAME.fullmatch(url.hostname):
            raise InvalidMetadata() from error
    return url


def _require_public(value: str) -> str:
    address = ip_address(value)
    if (not address.is_global or address.is_multicast or address.is_reserved
            or (address.version == 6 and address not in _IPV6_UNICAST)
            or any(address in network for network in _SPECIAL_NETWORKS)):
        raise InvalidMetadata()
    return f'[{address}]' if address.version == 6 else str(address)


def _resolve(host: str, port: int) -> list[str]:
    try:
        ip_address(host)
    except ValueError:
        pass
    else:
        _require_public(host)
        return []  # A literal IP requires no DNS override.
    # The worker retains the slot even if the request times out waiting for it.
    if not _DNS_SLOTS.acquire(blocking=False):  # pylint: disable=consider-using-with
        raise MetadataUnavailable()
    try:
        result = _DNS_WORKERS.submit(socket.getaddrinfo, host + '.', port, type=socket.SOCK_STREAM)
    except RuntimeError:
        _DNS_SLOTS.release()
        raise
    result.add_done_callback(lambda _: _DNS_SLOTS.release())
    try:
        records = result.result(timeout=1.5)
    except (OSError, TimeoutError) as error:
        raise MetadataUnavailable() from error
    addresses = list(dict.fromkeys(_require_public(str(record[4][0])) for record in records))
    if not addresses:
        raise MetadataUnavailable()
    return addresses


def _download(client_id: str, host: str, port: int) -> bytes:
    addresses = _resolve(host, port)
    command = [
        'curl', '--disable', '--silent', '--globoff', '--path-as-is', '--http1.1', '--noproxy', '*',
        '--proto', '=https', '--connect-timeout', '2', '--max-time', '4', '--max-filesize', str(MAX_DOCUMENT),
        '--header', 'Accept: application/json', '--include',
    ]
    if addresses:
        # Pin the connection to vetted DNS answers while curl verifies TLS for the original hostname.
        command.extend(('--resolve', f'{host}:{port}:{",".join(addresses)}'))
    command.extend(('--url', client_id))
    try:
        with subprocess.Popen(
            command, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
        ) as transfer:
            assert transfer.stdout is not None
            response = transfer.stdout.read(MAX_RESPONSE + 1)
            if len(response) > MAX_RESPONSE:
                transfer.kill()
                raise InvalidMetadata()
            try:
                status = transfer.wait(timeout=1)
            except subprocess.TimeoutExpired:
                transfer.kill()
                raise
    except (OSError, subprocess.TimeoutExpired) as error:
        raise MetadataUnavailable() from error
    if status == 63:  # curl rejected the advertised file size.
        raise InvalidMetadata()
    if status:
        raise MetadataUnavailable()
    return response


def _cache_seconds(headers) -> int:
    controls = ','.join(headers.get_all('cache-control', []))
    if re.search(r'(?:^|,)\s*(?:no-cache|no-store|private)\b', controls, re.IGNORECASE):
        return 0
    age_limit = re.search(r'(?:^|,)\s*max-age\s*=\s*"?([0-9]{1,9})"?(?=\s*(?:,|$))', controls, re.IGNORECASE)
    age = headers.get('age', '0')
    seconds = min(int(age_limit[1]), MAX_CACHE_SECONDS) if age_limit else 30
    return max(0, seconds - int(age)) if re.fullmatch(r'[0-9]{1,9}', age) else 0


def _load_document(response: bytes) -> tuple[dict, int]:
    head, separator, body = response.partition(b'\r\n\r\n')
    status, line, header_fields = head.partition(b'\r\n')
    match = re.fullmatch(rb'HTTP/1\.[01] ([0-9]{3})(?: .*)?', status)
    if not separator or not line or not match or len(body) > MAX_DOCUMENT:
        raise InvalidMetadata()
    if match[1] in (b'429', b'503') or match[1].startswith(b'5'):
        raise MetadataUnavailable()
    if match[1] != b'200':
        raise InvalidMetadata()
    headers = BytesHeaderParser().parsebytes(header_fields + b'\r\n\r\n')
    if len(headers.get_all('content-type', [])) != 1 or not re.fullmatch(
        r'application/(?:json|[^/]+\+json)', headers.get_content_type(),
    ):
        raise InvalidMetadata()
    try:
        metadata = json.loads(body.decode('utf-8'))
    except (ValueError, RecursionError) as error:
        raise InvalidMetadata() from error
    if not isinstance(metadata, dict):
        raise InvalidMetadata()
    return metadata, _cache_seconds(headers)


def _accepts(metadata: dict, key: str, expected: str, default: list[str]) -> bool:
    values = metadata.get(key, default)
    return isinstance(values, list) and all(isinstance(value, str) for value in values) and expected in values


def discover(client_id: str) -> ClientMetadata:
    ''' Validate and cache public client metadata. Only validated public clients enter the cache. '''
    url = client_identifier(client_id)
    cache = caches['oauth_client_metadata']
    key = hashlib.sha256(client_id.encode()).hexdigest()
    cached = cache.get(key)
    if isinstance(cached, ClientMetadata):
        return cached
    metadata, seconds = _load_document(_download(client_id, url.hostname, url.port or 443))
    name, redirects = metadata.get('client_name'), metadata.get('redirect_uris')
    if (metadata.get('client_id') != client_id or not isinstance(name, str) or len(name) > 256
            or not name.strip() or not name.isprintable() or not isinstance(redirects, list) or not redirects
            or not all(valid_redirect(uri) for uri in redirects)
            or not _accepts(metadata, 'grant_types', 'authorization_code', ['authorization_code'])
            or not _accepts(metadata, 'response_types', 'code', ['code'])
            or not _accepts(metadata, 'token_endpoint_auth_methods_supported', 'none',
                            [metadata.get('token_endpoint_auth_method', 'none')])):
        raise InvalidMetadata()
    result = ClientMetadata(name.strip(), tuple(redirects))
    if seconds:
        cache.set(key, result, seconds)
    return result
