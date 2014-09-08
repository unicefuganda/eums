from django.conf.urls import patterns, include, url
from django.contrib import admin

from eums.api.supply_plan.supply_plan import supplyPlanRouter


urlpatterns = patterns(
    '',
    url(r'^$', 'eums.views.home', name='home'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(supplyPlanRouter.urls))
)
