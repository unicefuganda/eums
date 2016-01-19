#!/usr/bin/python
import logging

import re
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)


def run(*args):
    if len(args) <= 0:
        logger.error("Arguments incorrect.")
        raise Exception('Arguments incorrect.')

    username_matcher = re.search('username=([^,]+)', args[0])
    password_matcher = re.search('password=([^,]+)', args[0])
    username = username_matcher.group(1) if username_matcher else ''
    password = password_matcher.group(1) if password_matcher else ''

    if not (username and password):
        logger.error("Arguments incorrect.")
        raise Exception('Arguments incorrect.')

    update_password(username, password)


def update_password(username, password):
    try:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        logger.info("User '%s' password updated." % username)
    except User.DoesNotExist:
        user = User.objects.create_superuser(username=username, email='admin@uniceflabs.org', password=password)
        logger.info("User '%s' created with email '%s'" % (user.username, user.email))

