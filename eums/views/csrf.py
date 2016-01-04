"""
CSRF_FAILURE_VIEW config for eums project.

A dotted path to the view function to be used when an incoming request is rejected by the CSRF protection.

For more information on this file, see
https://docs.djangoproject.com/en/dev/ref/settings/#csrf-failure-view
"""

from django.shortcuts import render_to_response


def csrf_failure(request, reason=""):
    ctx = {'message': 'some custom messages'}
    return render_to_response('403.html', ctx)
