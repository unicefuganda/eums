'use strict';

angular.module('Option', ['eums.config', 'eums.service-factory'])
    .factory('OptionService', function ($http, $q, EumsConfig, ServiceFactory) {
        var itemReceivedOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.RECEIVED_OPTIONS}).all;
        var itemQualityOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.QUALITY_OPTIONS}).all;
        var itemSatisfiedOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.SATISFIED_OPTIONS}).all;
        var deliveryReceivedOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.DELIVERY_RECEIVED_OPTIONS}).all;
        var deliverySatisfiedOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.DELIVERY_SATISFIED_OPTIONS}).all;
        var deliveryConditionOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.DELIVERY_CONDITION_OPTIONS}).all;

        var getItemService = function (question) {
            switch (question) {
                case 'received':
                    return itemReceivedOptions;
                case 'quality':
                    return itemQualityOptions;
                case 'satisfied':
                    return itemSatisfiedOptions;
                default:
                    throw 'unknown question';
            }
        };

        var getDeliveryService = function (question) {
            switch (question) {
                case 'received':
                    return deliveryReceivedOptions;
                case 'satisfied':
                    return deliverySatisfiedOptions;
                case 'good_condition':
                    return deliveryConditionOptions;
                default:
                    throw 'unknown question';
            }
        };

        var getResponseStatus = function () {
            var result = [{"id": 1, "text": "Complete"}, {"id": 2, "text": "Incomplete"}];
            var deferred = $q.defer();
            deferred.resolve(result);
            return deferred.promise;
        };

        var getResponseService = function () {
            return getResponseStatus;
        };

        return {
            getService: function (type, question) {
                switch (type) {
                    case 'item':
                        return getItemService(question);
                    case 'delivery':
                        return getDeliveryService(question);
                    case 'response':
                        return getResponseService();
                    default:
                        throw 'unknown type';
                }
            }
        };
    });
