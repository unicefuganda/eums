'use strict';

angular.module('eums.currencyFilters', [])
    .filter('compactCurrency', function($filter, compactNumberFilter) {
        return function(amount) {
            if (amount >= 1000000) {
                return '$' + compactNumberFilter(amount);
            } else if (amount >= 1000) {
                return '$' + compactNumberFilter(amount);
            }
            return $filter('currency')(amount);
        };
    })
    .filter('compactNumber', function() {
        return function(amount) {
            if (amount >= 1000000) {
                return (amount / 1.0e6).toFixed(1) + 'm';
            } else if (amount >= 1000) {
                return (amount / 1.0e3).toFixed(1) + 'k';
            }
            return amount.toFixed(2);
        };
    });