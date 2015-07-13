from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User, Group
from django import forms
from django.forms import ModelForm

from eums.models import UserProfile, Consignee


class UserProfileForm(UserCreationForm):
    groups = forms.ModelChoiceField(queryset=Group.objects.all(), empty_label=None, required=True,
                                    widget=forms.RadioSelect(attrs={'class': 'radio-roles'}), label="Role")
    consignees = Consignee.objects.filter(imported_from_vision=True).order_by('name')
    consignee = forms.ModelChoiceField(queryset=consignees, empty_label="Choose an Implementing Partner",
                                       required=False)

    def __init__(self, *args, **kwargs):
        super(UserProfileForm, self).__init__(*args, **kwargs)
        self.fields['password2'].label = 'Confirm Password'
        self.fields['email'].required = True

    class Meta:
        model = User
        fields = ("username", "password1", "password2", "email")

    def save(self, commit=True, *args, **kwargs):
        user = super(UserProfileForm, self).save(commit=commit, *args, **kwargs)
        if commit:
            user.groups.add(self.cleaned_data['groups'])
            user.save()
            self.save_m2m()
            user_profile, b = UserProfile.objects.get_or_create(user=user)
            user_profile.consignee = self.cleaned_data['consignee']
            user_profile.save()
        return user

    def _check_implementing_partner(self, message):
        consignee = self.cleaned_data.get('consignee', None)
        if not consignee:
            self._errors['consignee'] = self.error_class([message])

    def clean(self):
        group = self.cleaned_data.get('groups', None)
        message = "This field is required."
        if not group:
            self._errors['groups'] = self.error_class([message])
        elif group.name == 'Implementing Partner':
            self._check_implementing_partner(message)
        return super(UserProfileForm, self).clean()

    def clean_email(self):
        email = self.cleaned_data['email']
        return self._clean_attribute(User, email=email)

    def clean_username(self):
        username = self.cleaned_data['username']
        return self._clean_attribute(User, username=username)

    def _clean_attribute(self, _class, **kwargs):
        attribute_name = kwargs.keys()[0]
        data_attr = kwargs[attribute_name]
        users_with_same_attr = _class.objects.filter(**kwargs)
        if users_with_same_attr and self.initial.get(attribute_name, None) != str(data_attr):
            message = "%s is already associated to a different user." % data_attr
            self._errors[attribute_name] = self.error_class([message])
            del self.cleaned_data[attribute_name]
        return data_attr


class EditUserProfileForm(ModelForm):
    class Meta:
        model = User
        fields = ("username", "email", "is_active")

    def __init__(self, *args, **kwargs):
        super(EditUserProfileForm, self).__init__(*args, **kwargs)
        self.fields['email'].required = True

    def clean_email(self):
        email = self.cleaned_data['email']
        return self._clean_attribute(User, email=email)

    def clean_username(self):
        username = self.cleaned_data['username']
        return self._clean_attribute(User, username=username)

    def _clean_attribute(self, _class, **kwargs):
        attribute_name = kwargs.keys()[0]
        data_attr = kwargs[attribute_name]
        users_with_same_attr = _class.objects.filter(**kwargs)
        if users_with_same_attr and self.initial.get(attribute_name, None) != str(data_attr):
            message = "%s is already associated to a different user." % data_attr
            self._errors[attribute_name] = self.error_class([message])
            del self.cleaned_data[attribute_name]
        return data_attr
