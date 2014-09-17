from django.conf.urls import patterns, include, url

from django.contrib import admin
from eums.api.consignee.consignee import consigneeRouter

from eums.api.distribution_plan.distribution_plan import distributionPlanRouter
from eums.api.distribution_node.distribution_plan_node import distributionPlanNodeRouter

from eums.api.supply_plan.supply_plan import supplyPlanRouter


urlpatterns = patterns(
    '',
    url(r'^$', 'eums.views.home', name='home'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(supplyPlanRouter.urls)),
    url(r'^api/', include(distributionPlanRouter.urls)),
    url(r'^api/', include(distributionPlanNodeRouter.urls)),
    url(r'^api/', include(consigneeRouter.urls))
)