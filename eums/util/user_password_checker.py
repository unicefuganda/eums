import re
from django import forms


class UserPasswordChecker(object):
    PASSWORD_TOO_SHORT = 'Password is too short.'
    PASSWORD_WITHOUT_NUMBER = 'Password must contain at least one number'
    PASSWORD_WITHOU_CHARACTER = 'Password must contain at least one character'

    def __init__(self, password):
        super(UserPasswordChecker, self).__init__()
        self.password = password

    def check(self):
        self._check_length()
        self._check_number()
        self._check_character()

    def _check_length(self):
        if len(self.password) < 8:
            raise forms.ValidationError(self.PASSWORD_TOO_SHORT)

    def _check_number(self):
        if not re.match(r'^(?=.*\d).+$', self.password):
            raise forms.ValidationError(self.PASSWORD_WITHOUT_NUMBER)

    def _check_character(self):
        if not re.match(r'^(?=.*[a-zA-Z]).+$', self.password):
            raise forms.ValidationError(self.PASSWORD_WITHOU_CHARACTER)
