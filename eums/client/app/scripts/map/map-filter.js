angular.module('eums.mapFilter', ['eums.map', 'Delivery'])
    .factory('MapFilterService', function () {
        var allMarkers = [];
        return {
            setMapMarker: function (marker) {
                allMarkers.push(marker);
            },
            getAllMarkerMaps: function () {
                return allMarkers;
            }
        };
    });