from django.shortcuts import render
from django.views.generic import TemplateView
from braces.views import MultiplePermissionsRequiredMixin


class Home(MultiplePermissionsRequiredMixin, TemplateView):
    def __init__(self, *args, **kwargs):
        super(Home, self).__init__(*args, **kwargs)
        self.permissions = {'any': ('auth.can_view_users', 'auth.can_view_delivery_reports')}

    def get(self, *args, **kwargs):
        if self.request.user.has_perm('auth.can_view_users'):
            return self._render_unicef_view()
        return self._render_implementing_partner_view()

    def _render_unicef_view(self):
        return render(self.request, "index.html")

    def _render_implementing_partner_view(self):
        return render(self.request, "index.html")