from braces.views import PermissionRequiredMixin
from django.contrib import messages
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.views.generic import ListView, CreateView, UpdateView

from eums.forms.filter import UserFilterForm
from eums.forms.user_profile import UserProfileForm, EditUserProfileForm


class UsersList(PermissionRequiredMixin, ListView):
    permission_required = 'auth.can_view_users'

    def __init__(self, **kwargs):
        super(UsersList, self).__init__(**kwargs)
        self.template_name = 'users/index.html'
        self.model = User
        self.object_list = self.get_queryset()

    def get(self, *args, **kwargs):
        context = {'request': self.request, 'users': self.object_list, 'filter_form': UserFilterForm()}
        return self.render_to_response(context)

    def _query_for(self, post, query_key_map):
        query_params = dict((self._get_query_field(key, query_key_map), value) for key, value in post if
                            value.strip() != '' and key in query_key_map.keys())
        return query_params

    @staticmethod
    def _get_query_field(_key, query_key_map):
        return query_key_map.get(_key)

    def get_queryset(self):
        return self.model.objects.order_by('user_profile__created')


class CreateUser(PermissionRequiredMixin, CreateView):
    permission_required = 'auth.can_view_users'

    def __init__(self, **kwargs):
        super(CreateUser, self).__init__(**kwargs)
        self.form_class = UserProfileForm
        self.object = User
        self.template_name = "users/new.html"
        self.success_url = reverse('list_users_page')

    def form_valid(self, form):
        messages.success(self.request, "%s created successfully.")
        return super(CreateUser, self).form_valid(form)

    def form_invalid(self, form):
        return super(CreateUser, self).form_invalid(form)


    def get_context_data(self, **kwargs):
        context = super(CreateUser, self).get_context_data(**kwargs)
        context_vars = {'btn_label': "CREATE",
                        'title': "Create new user",
                        'id': 'create-user-form',
                        'cancel_url': reverse('list_users_page')}
        context.update(context_vars)
        return context


class EditUser(PermissionRequiredMixin, UpdateView):
    permission_required = 'auth.can_view_users'

    def __init__(self, **kwargs):
        super(EditUser, self).__init__(**kwargs)
        self.template_name = 'users/new.html'
        self.model = User
        self.form_class = EditUserProfileForm
        self.success_url = reverse('list_users_page')
        self.pk_url_kwarg = 'user_id'

    def get_context_data(self, **kwargs):
        context = super(EditUser, self).get_context_data(**kwargs)
        context['btn_label'] = "SAVE"
        context['cancel_url'] = reverse("list_users_page")
        context['title'] = "Edit User"
        return context

    def form_valid(self, form):
        message = "%s was successfully updated" % form.cleaned_data['username']
        messages.success(self.request, message)
        return super(EditUser, self).form_valid(form)

    def form_invalid(self, form):
        message = "User was not updated, see errors below"
        messages.error(self.request, message)
        return super(EditUser, self).form_invalid(form)