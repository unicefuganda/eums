'use strict';

angular.module('eums', ['ngRoute', 'Home', 'DistributionPlan', 'DirectDeliveryManagement', 'DirectDelivery', 'ReportedByIP', 'WarehouseDelivery', 'NewDistributionPlan',
    'NavigationTabs', 'eums.service-factory', 'gs.to-snake-case', 'gs.to-camel-case', 'ngTable', 'siTable', 'ui.bootstrap', 'eums.map', 'eums.ip',
    'ManualReporting', 'ManualReportingDetails', 'DatePicker', 'StockReport', 'ngToast', 'cgBusy', 'Responses', 'User', 'Contact',
    'ImportData', 'EndUserResponses', 'Directives', 'NewIpReport', 'WarehouseDeliveryPlan'])
    .config(function ($routeProvider, $httpProvider) {
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
            .when('/direct-delivery', {
                templateUrl: '/static/app/views/distribution-planning/direct-delivery.html',
                controller: 'DirectDeliveryController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_dashboard');
                    }
                }
            })
            .when('/direct-delivery/:purchaseOrderId-:purchaseOrderItemId-:distributionPlanNodeId', {
                templateUrl: '/static/app/views/distribution-planning/direct-delivery-management.html',
                controller: 'DirectDeliveryManagementController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_dashboard');
                    }
                }
            })
            .when('/direct-delivery/:purchaseOrderId-:purchaseOrderItemId', {
                templateUrl: '/static/app/views/distribution-planning/direct-delivery-management.html',
                controller: 'DirectDeliveryManagementController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_dashboard');
                    }
                }
            })
            .when('/direct-delivery/:purchaseOrderId', {
                templateUrl: '/static/app/views/distribution-planning/direct-delivery-management.html',
                controller: 'DirectDeliveryManagementController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_dashboard');
                    }
                }
            })
            .when('/warehouse-delivery', {
                templateUrl: '/static/app/views/distribution-planning/warehouse-delivery.html',
                controller: 'WarehouseDeliveryController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_dashboard');
                    }
                }
            })
            .when('/reported-by-ip', {
                templateUrl: '/static/app/views/distribution-planning/reported-by-ip.html',
                controller: 'IPPurchaseOrdersController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_delivery_reports');
                    }
                }
            })
            .when('/ip-delivery-report/new/:purchaseOrderId', {
                templateUrl: '/static/app/views/reported-by-ip/new-ip-delivery-report.html',
                controller: 'NewIpDeliveryController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_delivery_reports');
                    }
                }
            })
            .when('/ip-delivery-report/new/:purchaseOrderId/:purchaseOrderItemId', {
                templateUrl: '/static/app/views/reported-by-ip/new-ip-delivery-report.html',
                controller: 'NewIpDeliveryController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_delivery_reports');
                    }
                }
            })
            .when('/ip-delivery-report/new/:purchaseOrderId/:purchaseOrderItemId/:deliveryNodeId', {
                templateUrl: '/static/app/views/reported-by-ip/new-ip-delivery-report.html',
                controller: 'NewIpDeliveryController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_delivery_reports');
                    }
                }
            })
            .when('/delivery-report/new/:purchaseOrderId-:purchaseOrderItemId-:distributionPlanNodeId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_delivery_reports');
                    }
                }
            })
            .when('/delivery-report/new/:purchaseOrderId-:purchaseOrderItemId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_delivery_reports');
                    }
                }
            })
            .when('/delivery-report/new/:purchaseOrderId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_delivery_reports');
                    }
                }
            })
            .when('/distribution-plan/new/:purchaseOrderId-:purchaseOrderItemId-:distributionPlanNodeId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_distribution_plans');
                    }
                }
            })
            .when('/distribution-plan/new/:purchaseOrderId-:purchaseOrderItemId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_distribution_plans');
                    }
                }
            })
            .when('/distribution-plan/new/:purchaseOrderId', {
                templateUrl: '/static/app/views/distribution-planning/new.html',
                controller: 'NewDistributionPlanController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_distribution_plans');
                    }
                }
            })
            .when('/warehouse-delivery/new/:releaseOrderId', {
                templateUrl: '/static/app/views/distribution-planning/warehouse-delivery-plan.html',
                controller: 'WarehouseDeliveryPlanController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_distribution_plans');
                    }
                }
            })
            //new distribution plan routes end here
            .when('/delivery-report/proceed/', {
                templateUrl: '/static/app/views/distribution-planning/select-items.html',
                controller: 'NewDistributionPlanController',
                resolve: {
                    permission: function (UserService) {
                        return UserService.checkUserPermission('auth.can_view_delivery_reports');
                    }
                }
            })
            .when('/end-user-responses', {
                templateUrl: '/static/app/views/reports/end-user-responses.html',
                controller: 'EndUserResponsesController',
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
                controller: 'ConsigneesController'
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
