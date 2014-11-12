from django import forms

class UserFilterForm(forms.Form):
    organization = None
    # organization = forms.ModelChoiceField(queryset=Organization.objects.order_by('name'),
    #                                       empty_label="All",
    #                                       widget=forms.Select(attrs={"class": 'form-control region-select'}),
    #                                       required=False)
    # region = forms.ModelChoiceField(queryset=Region.objects.all(), empty_label="All",
    #                                 widget=forms.Select(attrs={"class": 'form-control region-select'}), required=False)
    #
    # role = forms.ModelChoiceField(queryset=Group.objects.order_by('name'), empty_label="All",
    #                               widget=forms.Select(attrs={"class": 'form-control region-select'}), required=False)

