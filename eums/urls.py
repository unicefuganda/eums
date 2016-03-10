from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.views.generic import RedirectView
from eums.api.alert.alert_endpoint import alert_router, AlertCount
from eums.api.answer.answers_endpoint import ConsigneeResponses, AllConsigneeResponses, AllEndUserResponses, \
    NodeResponses, AllIPResponses
from eums.api.answer.multiple_choice_answers_endpoint import multipleChoiceAnswerRouter
from eums.api.answer.numeric_answers_endpoint import numericAnswerRouter
from eums.api.answer.plan_answers_endpoint import PlanResponses
from eums.api.answer.text_answers_endpoint import textAnswerRouter
from eums.api.answer.web_answers_endpoint import WebAnswerEndpoint
from eums.api.consignee.consignee_endpoint import consigneeRouter
from eums.api.consignee_item.consignee_item_endpoint import consignee_items_router
from eums.api.csv.export_alert_endpoint import ExportAlertViewSet
from eums.api.contact.contact_endpoint import ContactEndpoint
from eums.api.csv.export_delivery_endpoint import ExportDeliveryViewSet
from eums.api.csv.export_delivery_feedback_report_endpoint import ExportDeliveryFeedbackReportViewSet
from eums.api.csv.export_item_feedback_report_endpoint import ExportItemFeedbackReportViewSet
from eums.api.csv.export_stock_report_endpoint import ExportStockReportViewSet
from eums.api.csv.export_supply_efficiency_report_endpoint import ExportSupplyEfficiencyReportViewSet
from eums.api.delivery_stats.delivery_stats_details_endpoint import DeliveryStatsDetailsEndpoint
from eums.api.delivery_stats.latest_deliveries import LatestDeliveriesEndpoint
from eums.api.delivery_stats.delivery_stats_map_endpoint import DeliveryStatsMapEndpoint
from eums.api.distribution_plan.distribution_plan_endpoint import distributionPlanRouter
from eums.api.distribution_plan_node.distribution_plan_node_endpoint import distributionPlanNodeRouter
from eums.api.distribution_report.distribution_report_endpoint import distributionReportRouter
from eums.api.ip_feedback_report.ip_feedback_report_by_delivery_endpoint import IpFeedbackReportEndpoint
from eums.api.item.item_endpoint import itemRouter
from eums.api.item_feedback_report.item_feedback_report_endpoint import ItemFeedbackReportEndpoint
from eums.api.item_unit.item_unit_endpoint import itemUnitRouter
from eums.api.option.option_endpoint import optionRouter
from eums.api.programme.programme_endpoint import programmeRouter
from eums.api.purchase_order.purchase_order_endpoint import purchaseOrderRouter
from eums.api.purchase_order_item.purchase_order_item_endpoint import purchaseOrderItemRouter
from eums.api.question.question_endpoint import questionRouter
from eums.api.release_order.release_order_endpoint import releaseOrderRouter
from eums.api.release_order_item.release_order_item_endpoint import releaseOrderItemRouter
from eums.api.run.run import runRouter
from eums.api.sales_order.sales_order_endpoint import salesOrderRouter
from eums.api.sales_order_item.sales_order_item_endpoint import salesOrderItemRouter, soItemPOItem
from eums.api.stock_report.stock_report_endpoint import StockReport
from eums.api.system_settings.system_settings_endpoint import system_settings_routers
from eums.api.user.user_endpoint import userRouter
from eums.forms.user_password_change import UserPasswordChangeForm
from eums.forms.user_password_reset import UserPasswordSetForm
from eums.views.home import Home
from eums.views.users import UsersList, CreateUser, EditUser

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
    url(r'^api/ip-feedback-report-by-delivery', IpFeedbackReportEndpoint.as_view(),
        name='ip_feedback_report_by_delivery'),
    url(r'^api/item-feedback-report', ItemFeedbackReportEndpoint.as_view(),
        name='item_feedback_report'),
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
    url(r'^api/login_data', 'eums.api.login.login_endpoint.login_data', name='login_data'),
    url(r'^api/current-user', 'eums.api.current_user.current_user_endpoint.current_user',
        name='current-user'),
    url(r'^api/programme/with-ips/', 'eums.api.programme.programmes_with_ips_endpoint.programmes_with_ips',
        name='programmes_ips'),
    url(r'^api/web-answers', WebAnswerEndpoint.as_view(), name='save_answers'),
    url(r'^api/so-item-po-item/(?P<sales_order_item_id>\d+)/$',
        soItemPOItem.as_view(), name='so_item_po_item'),
    url(r'^api/responses/(?P<consignee_id>\d+)/$', ConsigneeResponses.as_view(), name='consignee_responses'),
    url(r'^api/stock-report', StockReport.as_view(), name='stock_report'),
    url(r'^api/responses/$', AllConsigneeResponses.as_view(), name='all_consignee_responses'),
    url(r'^api/node-responses/(?P<node_id>\d+)/$', NodeResponses.as_view(), name='node_responses'),
    url(r'^api/end-user-responses/$', AllEndUserResponses.as_view(), name='all_end_user_responses'),
    url(r'^api/delivery-stats/details/$', DeliveryStatsDetailsEndpoint.as_view(), name='delivery_stats_details'),
    url(r'^api/delivery-stats/map/$', DeliveryStatsMapEndpoint.as_view(), name='delivery_stats_map'),
    url(r'^api/latest-deliveries/$', LatestDeliveriesEndpoint.as_view(), name='latest_deliveries'),
    url(r'^api/ip-responses/$', AllIPResponses.as_view(), name='all_ip_responses'),
    url(r'^api/distribution-plan-responses/(?P<consignee_id>\d+)/sales_order_item/(?P<sales_order_item_id>\d+)/',
        PlanResponses.as_view(), name='distribution_plan_responses'),

    url(r'^users/$', UsersList.as_view(), name="list_users_page"),
    url(r'^users/new/$', CreateUser.as_view(), name="create_user_page"),
    url(r'^users/(?P<user_id>\d+)/edit/$', EditUser.as_view(), name="edit_user"),

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
    url(r'^api/', include(consignee_items_router.urls)),
    url(r'^api/', include(consignee_items_router.urls)),
    url(r'^api/alert/count/$', AlertCount.as_view()),
    url(r'^api/', include(alert_router.urls)),
    url(r'^api/', include(system_settings_routers.urls)),
    url(r'^api/upload-image/', 'eums.api.import_data.upload_image_endpoint.upload_image', name='upload_image'),
    url(r'^api/contacts', ContactEndpoint.as_view(), name='contacts'),

    url(r'^exports/deliveries/', ExportDeliveryViewSet.as_view(),
        name='warehouse_deliveries_csv'),
    url(r'^exports/deliveries-feedback-report/', ExportDeliveryFeedbackReportViewSet.as_view(),
        name='deliveries_feedback_report_csv'),
    url(r'^exports/items-feedback-report/', ExportItemFeedbackReportViewSet.as_view(),
        name='items_feedback_report_csv'),
    url(r'^exports/stocks-report/', ExportStockReportViewSet.as_view(),
        name='stocks_feedback_report_csv'),
    url(r'^exports/alerts/', ExportAlertViewSet.as_view(),
        name='alerts_csv'),
    url(r'^exports/supply-efficiency-report/', ExportSupplyEfficiencyReportViewSet.as_view(),
        name='supply_efficiency_report_csv'),

    url(r'^change_password/$', 'django.contrib.auth.views.password_change',
        {'password_change_form': UserPasswordChangeForm}),
    url(r'^reset/(?P<token>[\w:-]+)/$', 'django.contrib.auth.views.password_reset_confirm',
        {'set_password_form': UserPasswordSetForm})

) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
