''' Start a loopback Portal using a fresh SQLite database and synthetic accounts. '''
import json
import os
import sys
from pathlib import Path
from secrets import token_hex
from wsgiref.simple_server import WSGIRequestHandler, make_server


backend = Path(__file__).resolve().parents[2] / 'backend'
sys.path.insert(0, str(backend))
os.environ.update(DJANGO_SETTINGS_MODULE='project.settings', DEBUG='1', ALLOWED_HOSTS='127.0.0.1',
                  DB_NAME=sys.argv[1], DB_ENGINE='django.db.backends.sqlite3', SECRET_KEY=token_hex(32),
                  AGENT_MCP_OAUTH_CONFIG='null', SENTRY_DSN='')

import django  # noqa: E402

django.setup()

from django.core.management import call_command  # noqa: E402
from django.core.wsgi import get_wsgi_application  # noqa: E402

from apps.agents.models import ApiKey  # noqa: E402
from apps.rsform.models import RSForm  # noqa: E402
from apps.users.models import User  # noqa: E402


class FixtureHandler(WSGIRequestHandler):
    ''' Keep HTTP logs and context-search query strings out of the eval output. '''

    def log_message(self, _format, *args):
        return None


call_command('migrate', verbosity=0, interactive=False)
owner = User.objects.create_user(username='Eval public')
public = RSForm.create(title='Public metadata', alias='PUBLIC', owner=owner, location='/S', access_policy='public')
accounts = {}
for mode in ('baseline', 'candidate'):
    user = User.objects.create_user(username=f'Eval {mode}')
    schema = RSForm.create(title='Source fixture', alias='SOURCE', owner=user, location='/U/Eval', access_policy='private')
    schema.insert_last('X1')
    _, token = ApiKey.create_for_user(user, 'Synthetic evaluation key')
    accounts[mode] = {'account': user.pk, 'schema': schema.model.pk, 'token': token}

with make_server('127.0.0.1', 0, get_wsgi_application(), handler_class=FixtureHandler) as server:
    print('RSTOOL_EVAL_FIXTURE ' + json.dumps({'port': server.server_port, 'public': public.model.pk,
                                              'accounts': accounts}), flush=True)
    server.serve_forever()
