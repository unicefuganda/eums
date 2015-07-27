from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic import RedirectView

from eums.api.answer.answers_endpoint import ConsigneeResponses, AllConsigneeResponses, AllEndUserResponses, \
    NodeResponses
from eums.api.answer.text_answers_endpoint import textAnswerRouter
from eums.api.answer.numeric_answers_endpoint import numericAnswerRouter
from eums.api.answer.multiple_choice_answers_endpoint import multipleChoiceAnswerRouter
from eums.api.answer.plan_answers_endpoint import PlanResponses
from eums.api.consignee.consignee_endpoint import consigneeRouter
from eums.api.consignee_purchase_order_items.consignee_purchase_order_item_endpoint import ConsigneePurchaseOrderItems, \
    ConsigneePurchaseOrderItemNode
from eums.api.distribution_plan.distribution_plan_endpoint import distributionPlanRouter
from eums.api.distribution_plan_node.distribution_plan_node_endpoint import distributionPlanNodeRouter
from eums.api.item.item_endpoint import itemRouter
from eums.api.item_unit.item_unit_endpoint import itemUnitRouter
from eums.api.run.run import runRouter
from eums.api.programme.programme_endpoint import programmeRouter
from eums.api.release_order.release_order_endpoint import releaseOrderRouter
from eums.api.release_order_item.release_order_item_endpoint import releaseOrderItemRouter
from eums.api.sales_order.sales_order_endpoint import salesOrderRouter
from eums.api.sales_order_item.sales_order_item_endpoint import salesOrderItemRouter, soItemPOItem
from eums.api.purchase_order.purchase_order_endpoint import purchaseOrderRouter
from eums.api.purchase_order_item.purchase_order_item_endpoint import purchaseOrderItemRouter
from eums.api.distribution_report.distribution_report_endpoint import distributionReportRouter
from eums.api.stock_report.stock_report_endpoint import StockReport
from eums.api.question.question_endpoint import questionRouter
from eums.api.user.user_endpoint import userRouter
from eums.views.users import UsersList, CreateUser, EditUser
from eums.views.home import Home
from eums.api.option.option_endpoint import optionRouter

urlpatterns = patterns(
    '',
    url(r'^$', Home.as_view(), name='home'),
    url(r'^login/$', 'django.contrib.auth.views.login',
        {'template_name': 'registration/login.html'}, name="login"),
    url(r'^logout/$', 'django.contrib.auth.views.logout',
        {'template_name': 'registration/login.html'}, name="logout"),
    url(r'^api/hook', 'eums.api.rapid_pro_hooks.hook.hook', name='hook'),
    url(r'^api/import-sales-orders/', 'eums.api.import_data.import_orders_endpoint.import_sales_orders',
        name='import_sales_orders'),
    url(r'^api/import-release-orders/', 'eums.api.import_data.import_orders_endpoint.import_release_orders',
        name='import_release_orders'),
    url(r'^api/import-purchase-orders/', 'eums.api.import_data.import_orders_endpoint.import_purchase_orders',
        name='import_purchase_orders'),
    url(r'^api/import-consignees/', 'eums.api.import_data.import_orders_endpoint.import_consignees',
        name='import_consignees'),
    url(r'^api/import-programmes/', 'eums.api.import_data.import_orders_endpoint.import_programmes',
        name='import_programmes'),
    url(r'^api/permission/all', 'eums.api.permissions.permissions_endpoint.retrieve_user_permissions',
        name='retrieve_permissions'),
    url(r'^api/permission', 'eums.api.permissions.permissions_endpoint.check_user_permission',
        name='permissions'),
    url(r'^api/current-user', 'eums.api.current_user.current_user_endpoint.current_user',
        name='current-user'),
    url(r'^api/consignee-purchase-order-items/(?P<consignee_id>\d+)/purchase-order/(?P<purchase_order_id>\d+)/$',
        ConsigneePurchaseOrderItems.as_view(), name='consignee_purchase_order_items'),
    url(r'^api/consignee-purchase-order-items/(?P<consignee_id>\d+)/sales-order-item/(?P<sales_order_item_id>\d+)/$',
        ConsigneePurchaseOrderItemNode.as_view(), name='consignee_purchase_order_item_node'),
    url(r'^api/so-item-po-item/(?P<sales_order_item_id>\d+)/$',
        soItemPOItem.as_view(), name='so_item_po_item'),
    url(r'^api/responses/(?P<consignee_id>\d+)/$', ConsigneeResponses.as_view(), name='consignee_responses'),
    url(r'^api/stock-report/(?P<consignee_id>\d+)/$', StockReport.as_view(), name='stock_report'),
    url(r'^api/responses/$', AllConsigneeResponses.as_view(), name='all_consignee_responses'),
    url(r'^api/node-responses/(?P<node_id>\d+)/$', NodeResponses.as_view(), name='node_responses'),
    url(r'^api/end-user-responses/$', AllEndUserResponses.as_view(), name='all_end_user_responses'),
    url(r'^api/distribution-plan-responses/(?P<consignee_id>\d+)/sales_order_item/(?P<sales_order_item_id>\d+)/',
        PlanResponses.as_view(), name='distribution_plan_responses'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^reset/done/$', RedirectView.as_view(url='/login')),
    url('', include('password_reset.urls')),
    url('', include('django.contrib.auth.urls')),
    url(r'^api/', include(distributionPlanRouter.urls)),
    url(r'^api/', include(distributionPlanNodeRouter.urls)),
    url(r'^api/', include(runRouter.urls)),
    url(r'^api/', include(itemUnitRouter.urls)),
    url(r'^api/', include(itemRouter.urls)),
    url(r'^api/', include(programmeRouter.urls)),
    url(r'^api/', include(consigneeRouter.urls)),
    url(r'^api/', include(salesOrderRouter.urls)),
    url(r'^api/', include(salesOrderItemRouter.urls)),
    url(r'^api/', include(distributionReportRouter.urls)),
    url(r'^api/', include(userRouter.urls)),
    url(r'^api/', include(textAnswerRouter.urls)),
    url(r'^api/', include(numericAnswerRouter.urls)),
    url(r'^api/', include(multipleChoiceAnswerRouter.urls)),
    url(r'^api/', include(optionRouter.urls)),
    url(r'^api/', include(purchaseOrderRouter.urls)),
    url(r'^api/', include(purchaseOrderItemRouter.urls)),
    url(r'^api/', include(releaseOrderRouter.urls)),
    url(r'^api/', include(releaseOrderItemRouter.urls)),
    url(r'^api/', include(questionRouter.urls)),
    url(r'^users/$', UsersList.as_view(), name="list_users_page"),
    url(r'^users/new/$', CreateUser.as_view(), name="create_user_page"),
    url(r'^users/(?P<user_id>\d+)/edit/$', EditUser.as_view(), name="edit_user"),
)
