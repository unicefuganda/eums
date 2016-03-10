from django.contrib.auth.forms import SetPasswordForm

from eums.util.user_password_checker import UserPasswordChecker


class UserPasswordSetForm(SetPasswordForm):
    def clean_new_password1(self):
        password = self.cleaned_data.get('new_password1')
        UserPasswordChecker(password).check()
        return password
