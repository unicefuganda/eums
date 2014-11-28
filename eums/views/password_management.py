from password_reset.views import Recover, RecoverDone


class ChangePasswordView(Recover):
    template_name = 'users/change_password.html'
    search_fields = ['email']


class RecoverEmailSent(RecoverDone):
    template_name = 'users/recovery_email_sent.html'