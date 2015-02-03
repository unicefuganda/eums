from django.shortcuts import render
from django.views.generic import TemplateView
from braces.views import PermissionRequiredMixin


class Home(PermissionRequiredMixin, TemplateView):
    permission_required = 'auth.can_view_dashboard'

    def __init__(self, *args, **kwargs):
        super(Home, self).__init__(*args, **kwargs)

    def get(self, *args, **kwargs):
        return render(self.request, "index.html")