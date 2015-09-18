'use strict';


var interceptor = ['ngToast', '$q', function (ngToast, $q) {
    return {
        responseError: function (response) {
            if (response.status === 403 || response.status === 401) {
                ngToast.create({content: 'Unauthorized', class: 'danger'})
            }
            return $q.reject(response.data);
        }
    }
}];

angular.module('eums', ['ngRoute', 'Home', 'Delivery', 'MultipleIpDirectDelivery', 'DirectDelivery', 'WarehouseDelivery',
    'NavigationTabs', 'eums.service-factory', 'gs.to-snake-case', 'gs.to-camel-case', 'ngTable', 'siTable', 'ui.bootstrap', 'eums.map', 'eums.ip',
    'ManualReporting', 'ManualReportingDetails', 'DatePicker', 'StockReport', 'ngToast', 'cgBusy', 'Responses', 'User', 'Contact', 'IpItems',
    'ImportData', 'IpFeedbackReportByItem', 'Directives', 'WarehouseDeliveryManagement', 'EumsFilters', 'SingleIpDirectDelivery', 'IpDelivery',
    'DirectDeliveryIpChoice', 'Loader', 'IPResponses', 'ConsigneeItem', 'ItemsDeliveredToIp', 'DeliveriesByIp', 'Alerts', 'NewDeliveryByIp',
    'NewSubConsigneeDeliveryByIp', 'IpFeedbackReportByDelivery', 'EndUserFeedbackReport'])

.config(function ($routeProvider, $httpProvider) {
    $httpProvider.interceptors.push(interceptor);
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $routeProvider
        .when('/', {
            templateUrl: '/static/app/views/home.html',
            controller: 'HomeController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_dashboard');
                }
            }
        })
        .when('/alerts', {
            templateUrl: '/static/app/views/alerts/alerts.html',
            controller: 'AlertsController'
        })
        .when('/direct-delivery', {
            templateUrl: '/static/app/views/delivery/direct-delivery.html',
            controller: 'DirectDeliveryController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_dashboard');
                }
            }
        })
        .when('/direct-delivery/new/:purchaseOrderId', {
            templateUrl: '/static/app/views/delivery/direct-delivery-ip-choice.html',
            controller: 'DirectDeliveryIpChoiceController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_dashboard');
                }
            }
        })
        .when('/direct-delivery/new/:purchaseOrderId/single', {
            templateUrl: '/static/app/views/delivery/single-ip-direct-delivery.html',
            controller: 'SingleIpDirectDeliveryController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_dashboard');
                }
            }
        })
        .when('/direct-delivery/new/:purchaseOrderId/multiple', {
            templateUrl: '/static/app/views/delivery/multiple-ip-direct-delivery.html',
            controller: 'MultipleIpDirectDeliveryController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_dashboard');
                }
            }
        })
        .when('/direct-delivery/new/:purchaseOrderId/multiple/:purchaseOrderItemId', {
            templateUrl: '/static/app/views/delivery/multiple-ip-direct-delivery.html',
            controller: 'MultipleIpDirectDeliveryController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_dashboard');
                }
            }
        })
        .when('/warehouse-delivery', {
            templateUrl: '/static/app/views/delivery/warehouse-delivery.html',
            controller: 'WarehouseDeliveryController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_dashboard');
                }
            }
        })
        .when('/warehouse-delivery/new/:releaseOrderId', {
            templateUrl: '/static/app/views/delivery/warehouse-delivery-management.html',
            controller: 'WarehouseDeliveryManagementController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_distribution_plans');
                }
            }
        })
        .when('/ip-feedback-report-by-item', {
            templateUrl: '/static/app/views/reports/ip-feedback-report-by-item.html',
            controller: 'IpFeedbackReportByItemController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_reports');
                }
            }
        })
        .when('/end-user-feedback-report', {
            templateUrl: '/static/app/views/reports/end-user-feedback-report.html',
            controller: 'EndUserFeedbackReportController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_reports');
                }
            }
        })
        .when('/ip-feedback-report-by-delivery', {
            templateUrl: '/static/app/views/reports/ip-feedback-report-by-delivery.html',
            controller: 'IpFeedbackReportByDeliveryController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_reports');
                }
            }
        })
        .when('/ip-responses', {
            templateUrl: '/static/app/views/reports/ip-responses.html',
            controller: 'IPResponsesController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_reports');
                }
            }
        })
        .when('/field-verification-reports', {
            templateUrl: '/static/app/views/distribution-reporting/distribution-reporting.html',
            controller: 'ManualReportingController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_reports');
                }
            }
        })
        .when('/field-verification-details/purchase-order/:purchaseOrderId', {
            templateUrl: '/static/app/views/distribution-reporting/details.html',
            controller: 'ManualReportingDetailsController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_reports');
                }
            }
        })
        .when('/field-verification-details/waybill/:releaseOrderId', {
            templateUrl: '/static/app/views/distribution-reporting/details.html',
            controller: 'ManualReportingDetailsController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_reports');
                }
            }
        })
        .when('/reports', {
            templateUrl: '/static/app/views/reports/ip-stock-report.html',
            controller: 'StockReportController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_reports');
                }
            }
        })
        .when('/import-data', {
            templateUrl: '/static/app/views/import-data/import-data.html',
            controller: 'ImportDataController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_reports');
                }
            }
        })
        .when('/distribution-plan-responses', {
            templateUrl: '/static/app/views/reports/responses.html',
            controller: 'ResponsesController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_distribution_plans');
                }
            }
        })
        .when('/contacts', {
            templateUrl: '/static/app/views/contacts/contacts.html',
            controller: 'ContactController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_contacts');
                }
            }
        })
        .when('/consignees', {
            templateUrl: '/static/app/views/consignees/consignees.html',
            controller: 'ConsigneesController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_consignees');
                }
            }
        })
        .when('/response-details/:district', {
            templateUrl: '/static/app/views/responses/index.html',
            controller: 'ResponseController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_reports');
                }
            }
        })
        .when('/ip-deliveries', {
            templateUrl: '/static/app/views/delivery/ip-delivery/delivery.html',
            controller: 'IpDeliveryController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_distribution_plans');
                }
            }
        })
        .when('/items-delivered-to-ip/:activeDeliveryId', {
            templateUrl: '/static/app/views/delivery/ip-delivery/items-delivered-to-ip.html',
            controller: 'ItemsDeliveredToIpController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_distribution_plans');
                }
            }
        })
        .when('/ip-items', {
            templateUrl: '/static/app/views/delivery/ip-items.html',
            controller: 'IpItemsController'
        })
        .when('/deliveries-by-ip/:itemId', {
            templateUrl: '/static/app/views/delivery/ip-delivery/deliveries-by-ip.html',
            controller: 'DeliveriesByIpController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_distribution_plans');
                }
            }
        })
        .when('/deliveries-by-ip/:itemId/new', {
            templateUrl: '/static/app/views/delivery/ip-delivery/new-delivery-by-ip.html',
            controller: 'NewDeliveryByIpController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_distribution_plans');
                }
            }
        })
        .when('/deliveries-by-ip/:itemId/:parentNodeId/new', {
            templateUrl: '/static/app/views/delivery/ip-delivery/new-sub-consignee-delivery-by-ip.html',
            controller: 'NewSubConsigneeDeliveryByIpController',
            resolve: {
                permission: function (UserService) {
                    return UserService.checkUserPermission('auth.can_view_distribution_plans');
                }
            }
        })
        .otherwise({
            redirectTo: '/'
        });
}).run(function ($rootScope, $templateCache) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (typeof(current) !== 'undefined') {
            $templateCache.remove(current.templateUrl);
        }
    });
});
