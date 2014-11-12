from django.views.generic import TemplateView
from eums.mixins import LoginRequiredMixin


class Home(LoginRequiredMixin, TemplateView):
    template_name = "index.html"

