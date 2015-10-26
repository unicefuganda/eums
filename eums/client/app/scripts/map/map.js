(function (module) {
    var SEVENTY_FIVE_PERCENT = 75, FIFTY_PERCENT = 50;

    function getNumberOf(receivedCriteria, data) {
        return data.filter(function (answer) {
            return answer.productReceived && answer.productReceived.toLowerCase() === receivedCriteria.toLowerCase();
        });
    }

    function getNumberOfIssues(receivedCriteria, data) {
        return data.filter(function (answer) {
            return answer.productReceived && answer.productReceived.toLowerCase() === receivedCriteria.toLowerCase() && answer.satisfiedWithProduct && answer.satisfiedWithProduct.toLowerCase() === 'no';
        });
    }

    function getHeatMapStyle(allDistricts, location) {
        var style = {
            fillColor: '#FFFFCC',
            fillOpacity: 1,
            weight: 1.5
        };
        allDistricts.forEach(function (district) {
            if (district.district === location) {
                style.fillColor = district.color;
            }
        });
        return style;
    }

    function getIpHeatMapStyle(data, layerName) {
        var style = {
            fillColor: '#FFFFCC',
            fillOpacity: 1,
            weight: 1.5
        };
        data.forEach(function (locationData) {
            if (locationData.location.toUpperCase() === layerName.toUpperCase()) {
                style.fillColor = locationData.state;
            }
        });
        return style;
    }

    function getPercentage(noProductReceived, consigneeResponses) {
        return noProductReceived / consigneeResponses.length * 100;
    }

    function getPercentageReceived(consigneeResponses) {
        var noProductReceived = getNumberOf("yes", consigneeResponses).length;
        return getPercentage(noProductReceived, consigneeResponses);
    }

    function getPercentageReceivedWithIssues(consigneeResponses) {
        var noProductReceivedWithIssues = getNumberOfIssues("yes", consigneeResponses).length;
        return getPercentage(noProductReceivedWithIssues, consigneeResponses);
    }

    function getHeatMapColor(consigneeResponses) {
        var RED = '#DE2F2F', GREEN = '#66BD63', ORANGE = '#FDAE61';
        var percentageReceived = getPercentageReceived(consigneeResponses);
        var percentageReceivedWithIssues = getPercentageReceivedWithIssues(consigneeResponses);

        if (percentageReceived >= SEVENTY_FIVE_PERCENT && percentageReceivedWithIssues < FIFTY_PERCENT) return GREEN;
        if ((percentageReceived < SEVENTY_FIVE_PERCENT && percentageReceived >= FIFTY_PERCENT) || percentageReceivedWithIssues >= FIFTY_PERCENT) return ORANGE;
        return RED;
    }

    function getHeatMapLayerColourForLocation(responsesWithLocation) {
        return responsesWithLocation.map(function (responseWithLocation) {
            return {
                district: responseWithLocation.location,
                color: getHeatMapColor(responseWithLocation.consigneeResponses),
            }
        });
    }

    module.factory('GeoJsonService', function ($http, EumsConfig) {
        return {
            districts: function () {
                return $http.get(EumsConfig.DISTRICTGEOJSONURL, {cache: true});
            }
        }
    });

    module.factory('MapService', function (GeoJsonService, EumsConfig, LayerMap, Layer, IPService,
                                           $q, DeliveryService, UserService, DeliveryStatsService, LoaderService) {
        var map, mapScope;

        var zoomControl = L.control.zoom({
            position: 'topleft',
            zoomOutText: '-'
        });

        function initMap(elementId) {
            var map = L.map(elementId, {
                zoomControl: false,
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
                attributionControl: false
            }).setView(EumsConfig.MAP_OPTIONS.CENTER, EumsConfig.MAP_OPTIONS.ZOOM_LEVEL);

            map.on('zoomend', function () {
                if (window.map.getZoom() < 8) {
                    mapScope.data.responses = [];
                    mapScope.data.district = '';
                    mapScope.filter = {
                        programme: '',
                        ip: '',
                        year: '',
                        from: '',
                        to: '',
                        received: true,
                        notDelivered: true,
                        receivedWithIssues: true
                    };
                    mapScope.isFiltered = false;
                    mapScope.data.allResponsesLocationMap = [];
                    DeliveryService.aggregateResponses().then(function (aggregates) {
                        mapScope.data.totalStats = aggregates;
                    });
                    addHeatMapLayer(mapScope);
                    window.map.setView(EumsConfig.MAP_OPTIONS.CENTER);
                }
            });

            return map;
        }

        function addHeatMapLayer(scope) {
            if (scope.ipView) {
                DeliveryStatsService.getIpStats(scope.filter).then(function (response) {
                    angular.forEach(LayerMap.getLayers(), function (layer, layerName) {
                        layer.setStyle(getIpHeatMapStyle(response.data, layerName));
                    });
                    DeliveryStatsService.getStats({treePosition:'IMPLEMENTING_PARTNER'}).then(function (responses) {
                        scope.data.totalStats = responses.data;
                    });
                    LoaderService.hideLoader();
                });

            } else {
                DeliveryService.groupAllResponsesByLocation().then(function (responsesWithLocation) {
                    filterResponsesForUser(responsesWithLocation).then(function (filteredResponses) {
                        scope.reponsesFromDb = filteredResponses;

                        if (scope.isFiltered || scope.notDeliveryStatus) {
                            scope.allResponsesMap = scope.data.allResponsesLocationMap
                        } else {
                            scope.allResponsesMap = scope.data.allResponsesLocationMap.length ? scope.data.allResponsesLocationMap : scope.reponsesFromDb;
                        }
                        var allLocations = getHeatMapLayerColourForLocation(scope.allResponsesMap);
                        angular.forEach(LayerMap.getLayers(), function (layer, layerName) {
                            layer.setStyle(getHeatMapStyle(allLocations, layerName));
                        });
                        DeliveryStatsService.getStats({treePosition: 'END_USER'}).then(function (responses) {
                            scope.data.totalStats = responses.data;
                        });
                        LoaderService.hideLoader();
                    });
                });
            }
        }

        function addDistrictsLayer(map, scope) {
            return GeoJsonService.districts().then(function (response) {
                L.geoJson(response.data, {
                    style: EumsConfig.districtLayerStyle,
                    onEachFeature: function (feature, layer) {
                        var districtName = feature.properties[EumsConfig.DISTRICT_NAME_LOCATOR] || 'unknown';
                        var districtLayer = Layer.build(map, layer, EumsConfig, scope, districtName);
                        LayerMap.addLayer(districtLayer, districtName.toLowerCase())
                    }
                }).addTo(map);
            });
        }

        function filterResponsesForUser(responsesToPlot) {
            return UserService.getCurrentUser().then(function (user) {
                if (user.consignee_id) {
                    var filteredIPResponses = responsesToPlot.map(function (responsesWithLocation) {
                        return responsesWithLocation.consigneeResponses.filter(function (response) {
                            return parseInt(response.consignee.id) === parseInt(user.consignee_id);
                        });
                    });
                    return DeliveryService.groupResponsesByLocation(_.flatten(filteredIPResponses));
                }
                else {
                    return responsesToPlot;
                }
            });
        }

        return {
            renderIpView: function (elementId, layerName, scope) {
                mapScope = scope;
                map = initMap(elementId);

                return addDistrictsLayer(map, scope).then(function () {
                    layerName && this.clickLayer(layerName);
                    return this;
                }.bind(this)).then(function () {
                    LoaderService.showLoader();
                    this.addHeatMap(scope);
                }.bind(this)).then(function () {
                    return this;
                }.bind(this));
            },
            renderEndUserView: function (elementId, layerName, scope) {
                mapScope = scope;
                map = initMap(elementId);

                return addDistrictsLayer(map, scope).then(function () {
                    layerName && this.clickLayer(layerName);
                    return this;
                }.bind(this)).then(function () {
                    LoaderService.showLoader();
                    this.addHeatMap(scope);
                }.bind(this)).then(function () {
                    return this;
                }.bind(this));
            },
            getZoom: function () {
                return map.getZoom();
            },
            addCustomZoomControl: function () {
                if (!zoomControl._zoomInButton) {
                    zoomControl.addTo(map);
                }
            },
            addHeatMap: function (scope) {
                addHeatMapLayer(scope);
            },
            getCenter: function () {
                return map.getCenter();
            },
            setView: function () {
                map.setView(EumsConfig.MAP_OPTIONS.CENTER);
            },
            highlightLayer: function (layerName) {
                LayerMap.selectLayer(layerName.toLowerCase());
            },
            getLayerName: function () {
                return LayerMap.getLayerName();
            },
            getStyle: function (layerName) {
                return LayerMap.getStyle(layerName);
            },
            getHighlightedLayer: function () {
                return LayerMap.getSelectedLayer();
            },
            getLayerCenter: function (layerName) {
                return LayerMap.getLayerCenter(layerName.toLowerCase());
            },
            getLayerBounds: function (layerName) {
                return LayerMap.getLayerBoundsBy(layerName);
            },
            clickLayer: function (layerName, scope) {
                if (layerName) {
                    LayerMap.clickLayer(layerName.toLowerCase(), scope);
                    this.highlightLayer(layerName);
                }
            },
            setDefaultView: function () {
                map.setView(EumsConfig.MAP_OPTIONS.CENTER, EumsConfig.MAP_OPTIONS.ZOOM_LEVEL);
            }
        };
    });

    module.directive('defaultView', function (MapService) {
        return function (scope, element) {
            element.click(function () {
                MapService.setDefaultView();
            });
        }
    });

    module.directive('map', function (MapService, $window, IPService, DeliveryService) {
        return {
            scope: false,
            link: function (scope, element, attrs) {
                MapService.renderEndUserView(attrs.id, null, scope).then(function (map) {
                    $window.map = map;
                    scope.programme = '';
                    scope.notDeliveredChecked = false;
                    scope.deliveredChecked = null;

                    DeliveryService.aggregateResponses().then(function (aggregates) {
                        scope.data.totalStats = aggregates;
                    });
                });

                scope.clearFilters = function () {
                    $("#select-program").select2("val", "");
                    $("#select-ip").select2("val", "");
                    scope.filter = {programme: '', ip: '', from: '', to: '', year: ''};
                    scope.deliveryStatus = {received: true, notDelivered: true, receivedWithIssues: true};
                    scope.data.allResponsesLocationMap = scope.reponsesFromDb;
                };

            }
        }
    })
        .directive('mapFilter', function () {
            return {
                restrict: 'E',
                scope: false,
                templateUrl: '/static/app/views/partials/filters.html'
            }
        })
        .directive('mapSummary', function () {
            return {
                restrict: 'A',
                scope: false,
                templateUrl: '/static/app/views/partials/marker-summary.html'
            }
        })
        .directive('mapFilters', function (DeliveryService, DeliveryStatsService) {
            function removeEmptyArray(filteredResponses) {
                return filteredResponses.filter(function (response) {
                    return response.length > 0;
                });
            }

            return {
                restrict: 'A',
                scope: false,
                link: function (scope) {
                    scope.$watchCollection('filter', function (newValue) {
                        var filteredResponses;
                        var responsesToPlot = [];
                        if (!newValue.programme && !newValue.ip && (scope.programmeFilter || scope.ipFilter)) {
                            scope.data.allResponsesLocationMap = scope.reponsesFromDb
                        }

                        if (newValue.programme) {
                            scope.isFiltered = true;
                            scope.programmeFilter = true;
                            filteredResponses = scope.reponsesFromDb.map(function (responseLocationMap) {
                                return responseLocationMap.consigneeResponses.filter(function (response) {
                                    return parseInt(response.programme.id) === parseInt(newValue.programme);
                                });
                            });
                            scope.data.allResponsesLocationMap = DeliveryService.groupResponsesByLocation(_.flatten(removeEmptyArray(filteredResponses)));
                        }

                        if (newValue.ip) {
                            scope.isFiltered = true;
                            scope.ipFilter = true;
                            if (scope.programmeFilter) {
                                responsesToPlot = scope.data.allResponsesLocationMap
                            }
                            if (!scope.programmeFilter || !newValue.programme) {
                                responsesToPlot = scope.reponsesFromDb
                            }

                            filteredResponses = responsesToPlot.map(function (responseLocationMap) {
                                return responseLocationMap.consigneeResponses.filter(function (response) {
                                    return parseInt(response.consignee.id) === parseInt(newValue.ip);
                                });
                            });
                            scope.data.allResponsesLocationMap = DeliveryService.groupResponsesByLocation(_.flatten(removeEmptyArray(filteredResponses)));
                        }

                        scope.data.topLevelResponses = scope.data.allResponsesLocationMap;
                    });


                    scope.$watch('data.allResponsesLocationMap', function () {
                        if (window.map.renderEndUserView && !scope.ipView) {
                            window.map.addHeatMap(scope);
                        }

                        if (scope.isFiltered || scope.notDeliveryStatus) {
                            scope.allResponsesMap = scope.data.allResponsesLocationMap
                        } else {
                            scope.allResponsesMap = scope.data.allResponsesLocationMap.length ? scope.data.allResponsesLocationMap : scope.reponsesFromDb;
                        }

                        if (scope.data.district) {
                            DeliveryStatsService.getStats({location: scope.data.district}).then(function (responses) {
                                scope.data.totalStats = responses.data;
                                scope.data.totalStats.location = scope.data.district;
                            });
                            //TODO: refactor this, to use same function with district on click
                            scope.data.responses = DeliveryService.getLatestItemDeliveries(scope.allResponsesMap, scope.data.district, 3);
                            (function showResponsesForDistrict() {
                                scope.data.responses = DeliveryService.getLatestItemDeliveries(scope.allResponsesMap, scope.data.district, 3);
                                scope.data.district = layerName;
                            })();
                        }
                    });
                }
            }

        })
        .directive('deliveryStatus', function (DeliveryService, UserService) {
            function filterResponsesForUser(responsesToPlot) {
                return UserService.getCurrentUser().then(function (user) {
                    if (user.consignee_id) {
                        var filteredIPResponses = responsesToPlot.map(function (responsesWithLocation) {
                            return responsesWithLocation.consigneeResponses.filter(function (response) {
                                return parseInt(response.ip.id) === parseInt(user.consignee_id);
                            });
                        });
                        return DeliveryService.groupResponsesByLocation(_.flatten(filteredIPResponses));
                    }
                    else {
                        return responsesToPlot;
                    }
                });
            }

            function getReceivedResponses(responsesToPlot) {
                return responsesToPlot.map(function (responseLocationMap) {
                    var percentageReceived = getPercentageReceived(responseLocationMap.consigneeResponses);
                    var percentageReceivedWithIssues = getPercentageReceivedWithIssues(responseLocationMap.consigneeResponses);
                    if (percentageReceived >= SEVENTY_FIVE_PERCENT && percentageReceivedWithIssues < FIFTY_PERCENT)
                        return responseLocationMap.consigneeResponses;
                    return [];
                });
            }

            function getNotReceivedResponses(responsesToPlot) {
                return responsesToPlot.map(function (responseLocationMap) {
                    var percentageReceived = getPercentageReceived(responseLocationMap.consigneeResponses);
                    return percentageReceived < FIFTY_PERCENT ? responseLocationMap.consigneeResponses : [];
                });
            }

            function getReceivedResponsesWithIssues(responsesToPlot) {
                return responsesToPlot.map(function (responseLocationMap) {
                    var percentageReceived = getPercentageReceived(responseLocationMap.consigneeResponses);
                    var percentageReceivedWithIssues = getPercentageReceivedWithIssues(responseLocationMap.consigneeResponses);
                    if ((percentageReceived < SEVENTY_FIVE_PERCENT && percentageReceived >= FIFTY_PERCENT) || percentageReceivedWithIssues >= FIFTY_PERCENT)
                        return responseLocationMap.consigneeResponses;
                    return [];
                });
            }

            return {
                restrict: 'A',
                scope: false,
                link: function (scope) {
                    scope.$watchCollection('deliveryStatus', function (newValue) {
                        var responsesToPlot = scope.data.topLevelResponses.length ?
                            scope.data.topLevelResponses : scope.notDeliveryStatus ?
                            scope.reponsesFromDb : !scope.notDeliveryStatus ?
                            scope.reponsesFromDb : scope.allResponsesMap;

                        var receivedResponses = [];
                        var notReceivedResponses = [];
                        var receivedResponsesWithIssues = [];

                        DeliveryService.groupAllResponsesByLocation().then(function (responsesWithLocation) {
                            filterResponsesForUser(responsesWithLocation).then(function (filteredResponses) {
                                scope.reponsesFromDb = filteredResponses;

                                if (newValue.received && newValue.notDelivered && newValue.receivedWithIssues) {
                                    if (scope.isFiltered) {
                                        scope.data.allResponsesLocationMap = scope.data.topLevelResponses && scope.data.topLevelResponses.length ? scope.data.topLevelResponses : scope.reponsesFromDb;
                                    } else {
                                        scope.data.allResponsesLocationMap = scope.reponsesFromDb;
                                    }
                                    return;
                                }

                                if (!newValue.received && !newValue.notDelivered && !newValue.receivedWithIssues) {
                                    scope.notDeliveryStatus = true;
                                    scope.data.allResponsesLocationMap = [];
                                    return;
                                }

                                scope.isFiltered = true;

                                if (newValue.received) {
                                    receivedResponses = getReceivedResponses(responsesToPlot)
                                }

                                if (newValue.notDelivered) {
                                    notReceivedResponses = getNotReceivedResponses(responsesToPlot);
                                }

                                if (newValue.receivedWithIssues) {
                                    receivedResponsesWithIssues = getReceivedResponsesWithIssues(responsesToPlot);
                                }

                                var received = receivedResponses.concat(receivedResponsesWithIssues);
                                var deliveryStatusResponses = notReceivedResponses.concat(received);
                                scope.data.allResponsesLocationMap = DeliveryService.groupResponsesByLocation(_.flatten(deliveryStatusResponses));
                            });
                        });
                    });
                }
            }
        })
        .directive('dateRangeFilter', function (DeliveryService, UserService) {
            function removeEmptyArray(filteredResponses) {
                return filteredResponses.filter(function (response) {
                    return response.length > 0;
                });
            }

            function filterResponsesForUser(responsesToPlot) {
                return UserService.getCurrentUser().then(function (user) {
                    if (user.consignee_id) {
                        var filteredIPResponses = responsesToPlot.map(function (responsesWithLocation) {
                            return responsesWithLocation.consigneeResponses.filter(function (response) {
                                return parseInt(response.consignee.id) === parseInt(user.consignee_id);
                            });
                        });
                        return DeliveryService.groupResponsesByLocation(_.flatten(removeEmptyArray(filteredIPResponses)));
                    }
                    else {
                        return responsesToPlot;
                    }
                });
            }

            return {
                restrict: 'A',
                scope: false,
                link: function (scope) {
                    scope.$watchCollection('[filter.from, filter.to]', function (newDates) {
                        var receivedResponses = [];
                        var fromDate = moment(newDates[0]);
                        var toDate = moment(newDates[1]);
                        var responsesToPlot = scope.data.topLevelResponses.length ?
                            scope.data.topLevelResponses : scope.notDeliveryStatus ?
                            scope.reponsesFromDb : !scope.notDeliveryStatus ?
                            scope.reponsesFromDb : scope.allResponsesMap;

                        function isWithinDateRange(dateOfReceipt) {
                            var dateRange = moment().range(fromDate, toDate);
                            return dateOfReceipt && dateRange.contains(moment(dateOfReceipt, 'DD-MMM-YYYY'));
                        }

                        if (newDates[0] && newDates[1]) {
                            scope.isFiltered = true;
                            receivedResponses = responsesToPlot.map(function (responseLocationMap) {
                                return responseLocationMap.consigneeResponses.filter(function (response) {
                                    return isWithinDateRange(response.dateOfReceipt);
                                });
                            });
                        }
                        var cleanedResponses = removeEmptyArray(receivedResponses);
                        scope.data.allResponsesLocationMap = DeliveryService.groupResponsesByLocation(_.flatten(cleanedResponses));
                        filterResponsesForUser(scope.data.allResponsesLocationMap).then(function (filteredResponses) {
                            scope.data.allResponsesLocationMap = filteredResponses;
                        });
                    });
                }
            }

        });
})
(angular.module('eums.map', ['eums.config', 'eums.ip', 'Programme', 'Delivery', 'DatePicker', 'map.layers', 'DeliveryStats', 'Loader']));

