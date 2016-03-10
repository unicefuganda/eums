from django.contrib.auth.forms import PasswordChangeForm

from eums.util.user_password_checker import UserPasswordChecker


class UserPasswordChangeForm(PasswordChangeForm):
    def clean_new_password1(self):
        password = self.cleaned_data.get('new_password1')
        UserPasswordChecker(password).check()
        return password
