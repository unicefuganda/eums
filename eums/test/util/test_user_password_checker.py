from unittest import TestCase

from django import forms

from eums.util.user_password_checker import UserPasswordChecker


class UserPasswordCheckerTest(TestCase):
    EXCEPTION_NOT_THROWN = 'No exception thrown'

    def test_should_raise_exception_when_password_is_too_short(self):
        short_password = 'p123'
        password_checker = UserPasswordChecker(short_password)

        with self.assertRaisesRegexp(forms.ValidationError, UserPasswordChecker.PASSWORD_TOO_SHORT):
            password_checker.check()

    def test_should_raise_exception_when_password_does_not_have_any_number(self):
        password_without_number = 'abcdefghi'
        password_checker = UserPasswordChecker(password_without_number)

        with self.assertRaisesRegexp(forms.ValidationError, UserPasswordChecker.PASSWORD_WITHOUT_NUMBER):
            password_checker.check()

    def test_should_raise_exception_when_password_does_not_have_any_character(self):
        password_without_character = '12345678'
        password_checker = UserPasswordChecker(password_without_character)

        with self.assertRaisesRegexp(forms.ValidationError, UserPasswordChecker.PASSWORD_WITHOUT_CHARACTER):
            password_checker.check()

    def test_should_not_raise_exception_when_password_meets_requirement(self):
        password = 'p1234567'
        password_checker = UserPasswordChecker(password)

        with self.assertRaisesRegexp(Exception, self.EXCEPTION_NOT_THROWN):
            password_checker.check()
            self.fail(self.EXCEPTION_NOT_THROWN)
