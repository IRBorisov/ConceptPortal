''' Utils: tester for database operations. '''
import logging

from django.db import connection
from rest_framework.test import APITestCase


class DBTester(APITestCase):
    ''' Abstract base class for Testing database. '''

    def setUp(self):
        self.logger = logging.getLogger('django.db.backends')
        self.logger.setLevel(logging.DEBUG)

    def start_db_log(self):
        ''' Warning! Do not use this second time before calling stop_db_log. '''
        ''' Warning! Do not forget to enable global logging in settings. '''
        logging.disable(logging.NOTSET)
        connection.force_debug_cursor = True

    def stop_db_log(self):
        connection.force_debug_cursor = False
        logging.disable(logging.CRITICAL)
