'use strict';

angular.module('Option', ['eums.config', 'eums.service-factory'])
    .factory('OptionService', function ($http, EumsConfig, ServiceFactory) {
        var itemReceivedOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.RECEIVED_OPTIONS}).all;
        var itemQualityOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.QUALITY_OPTIONS}).all;
        var itemSatisfiedOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.SATISFIED_OPTIONS}).all;
        var deliveryReceivedOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.DELIVERY_RECEIVED_OPTIONS}).all;
        var deliverySatisfiedOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.DELIVERY_SATISFIED_OPTIONS}).all;
        var deliveryConditionOptions = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.DELIVERY_CONDITION_OPTIONS}).all;

        var getItemService = function(question) {
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

        var getDeliveryService = function(question) {
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

        return {
            getService: function(type, question) {
                switch (type) {
                    case 'item':
                        return getItemService(question);
                    case 'delivery':
                        console.log('getDeliveryService', question);
                        return getDeliveryService(question);
                    default:
                        throw 'unknown type';
                }
            }
        };
    });
