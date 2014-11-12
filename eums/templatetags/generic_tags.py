from django import template
from django.core.urlresolvers import reverse

register = template.Library()


@register.filter
def display_list(_list):
    new_list = [str(item) for item in _list]
    return ', '.join(new_list)


@register.filter
def bootstrap_message(django_message):
    if django_message == 'error':
        return 'danger'
    return django_message


@register.filter
def get_url_with_ids(args, url_name):
    if not str(args).isdigit():
        arg_list = [int(arg) for arg in args.split(',')]
        return reverse(url_name, args=arg_list)
    return reverse(url_name, args=(args,))


@register.filter
def add_string(int_1, int_2):
    return "%s, %s" % (str(int_1), str(int_2))
