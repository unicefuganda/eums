'use strict';

angular.module('eums.currencyFilters', [])
    .filter('compactCurrency', function($filter, compactNumberFilter) {
        return function(amount) {
            return '$' + compactNumberFilter(amount);
        };
    })
    .filter('compactNumber', function() {
        return function(amount) {
            if (amount === undefined) {
                amount = 0;
            }
            if (amount >= 1000000) {
                return (amount / 1.0e6).toFixed(1) + 'm';
            }
            if (amount >= 1000) {
                return (amount / 1.0e3).toFixed(1) + 'k';
            }
            return amount.toFixed(0);
        };
    });
