angular.module('ExportDeliveries', ['eums.config', 'eums.service-factory'])
    .factory('ExportDeliveryService', function (EumsConfig, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.EXPORT_WAREHOUSE_DELIVERIES
        })

    });