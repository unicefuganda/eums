(function (module) {
    function getNumberOf(receivedCriteria, data) {
        return data.filter(function (answer) {
            return answer.productReceived && answer.productReceived.toLowerCase() === receivedCriteria.toLowerCase();
        });
    }

    function getMarkerContent(allDistricts, layerName) {
        var content = '';
        allDistricts.forEach(function (district) {
            if (district.district === layerName) {
                content = district.messages;
            }
        });
        return content;
    }

    function getHeatMapStyle(allDistricts, location) {
        var style = {
            fillColor: '#F1EEE8',
            fillOpacity: 0.6,
            weight: 1
        };
        allDistricts.forEach(function (district) {
            if (district.district === location) {
                style.fillColor = district.color;
            }
        });
        return style;
    }

    function getHeatMapColor(consigneeResponses) {
        var noProductReceived = getNumberOf("yes", consigneeResponses).length;
        var RED = '#DE2F2F', GREEN = '#66BD63', ORANGE = '#FDAE61';
        if (noProductReceived === consigneeResponses.length) return GREEN;
        if (noProductReceived > 0 && noProductReceived < consigneeResponses.length) return ORANGE;
        return RED;
    }

    function getHeatMapResponsePercentage(consigneeResponses) {
        var noProductReceived = getNumberOf("yes", consigneeResponses).length;
        return (noProductReceived / consigneeResponses.length) * 100;

    }

    function getHeatMapLayerColourForLocation(responsesWithLocation) {
        return responsesWithLocation.map(function (responseWithLocation) {
            return{
                district: responseWithLocation.location,
                color: getHeatMapColor(responseWithLocation.consigneeResponses),
                messages: getHeatMapResponsePercentage(responseWithLocation.consigneeResponses)
            }
        });
    }

    function getPinColourFromResponses(data) {
        var noProductRecieved = getNumberOf("yes", data).length;
        var RED = '#DE2F2F', GREEN = '#8AC43E', YELLOW = '#F6911D';
        if (noProductRecieved === data.length) return GREEN;
        if (noProductRecieved > 0 && noProductRecieved < data.length) return YELLOW;
        return RED;
    }

    function Marker(center, data, scope) {
        var markerIcon = function () {
            return new L.DivIcon({
                iconSize: new L.Point([10, 10]),
                className: "ips-marker-icon marker-icon ",
                html: "<div><i class='pin'><span style='background-color:" + getPinColourFromResponses(data) + "'></span></i></div>",
                popupAnchor: [5, -10]
            });
        };

        var marker = L.marker(center, {icon: markerIcon()});

        marker.nodeId = data[0].consignee.id;

        var assignClickedMarkerData = function () {
            scope.$apply(function () {
                scope.clickedMarker = data;
            });
        };

        marker.on('click', function () {
            var consigneeResponse = data[0];
            consigneeResponse && assignClickedMarkerData();
        });
        return marker;
    }

    function circleMarkerIcon(content) {
        return L.divIcon({
            iconSize: new L.Point(25, 25),
            className: 'messages-aggregate-marker-icon',
            html: '<div>' + content + '%</div>'
        });
    }

    function messagesAggregateMarker(map, layer, aggregateValue) {
        var marker = new L.Marker(layer.getCenter(), {
            icon: circleMarkerIcon(aggregateValue)
        });

        if (typeof(aggregateValue) === 'number') {
            return marker.addTo(map);
        }
    }


    module.factory('GeoJsonService', function ($http, EumsConfig) {
        return {
            districts: function () {
                return $http.get(EumsConfig.DISTRICTGEOJSONURL, {cache: true});
            }
        }
    });


    module.factory('MapService', function (GeoJsonService, EumsConfig, LayerMap, Layer, IPService, $q, MapFilterService, DistributionPlanService) {
        var map;

        function initMap(elementId) {
            var map = L.map(elementId, {
                zoomControl: true,
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false
            }).setView([1.406, 32.000], 7);

            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
                maxZoom: 13,
                minZoom: 7
            }).addTo(map);

            return map;
        }

        function addIPMarker(marker) {
            return marker.addTo(map);
        }

        function addHeatMapLayer(map) {
            DistributionPlanService.groupResponsesByLocation().then(function (responsesWithLocation) {
                var allLocations = getHeatMapLayerColourForLocation(responsesWithLocation);
                angular.forEach(LayerMap.getLayers(), function (layer, layerName) {
                    layer.setStyle(getHeatMapStyle(allLocations, layerName));
                    messagesAggregateMarker(map, layer, getMarkerContent(allLocations, layerName))
                });
            });
        }

        function addDistrictsLayer(map, scope) {
            return GeoJsonService.districts().then(function (response) {
                L.geoJson(response.data, {
                    style: EumsConfig.districtLayerStyle,
                    onEachFeature: function (feature, layer) {
                        var districtName = feature.properties.DNAME_2010 || 'unknown';
                        var districtLayer = Layer.build(map, layer, EumsConfig, scope, districtName);
                        LayerMap.addLayer(districtLayer, districtName.toLowerCase())
                    }
                }).addTo(map);
            });
        }

        return {
            render: function (elementId, layerName, scope) {
                map = initMap(elementId);

                return addDistrictsLayer(map, scope).then(function () {
                    layerName && this.clickLayer(layerName);
                    return this;
                }.bind(this)).then(function () {
                    addHeatMapLayer(map);
                }).then(function () {
                    return this;
                }.bind(this));
            },
            getZoom: function () {
                return map.getZoom();
            },
            getCenter: function () {
                return map.getCenter();
            },
            addAllMarkers: function () {
                var markers = [];
                MapFilterService.getAllMarkerMaps().forEach(function (markerMap) {
                    markers.push(markerMap.marker);
                });
                return L.layerGroup(markers).addTo(map);
            },
            addMarker: function (marker) {
                return addIPMarker(marker);
            },
            removeMarker: function (marker) {
                map.removeLayer(marker);
            },
            clearAllMarkers: function (markers) {
                var self = this;
                var clearMarkers = function (markerMap) {
                    self.removeMarker(markerMap.marker);
                };

                if (markers) {
                    markers.forEach(clearMarkers)
                } else {
                    MapFilterService.getAllMarkerMaps().forEach(clearMarkers);
                }
            },

            addMarkers: function (markersMap) {
                var markers = [];
                markersMap.forEach(function (markerMap) {
                    markers.push(markerMap.marker);
                });

                L.layerGroup(markers).addTo(map);
            },

            highlightLayer: function (layerName) {
                LayerMap.selectLayer(layerName.toLowerCase());
            },
            getHighlightedLayer: function () {
                return LayerMap.getSelectedLayer();
            },
            mapIPsToRandomLayerCoordinates: function (layerName) {
                var self = this;
                return IPService.groupIPsByDistrict(layerName).then(function (ips) {
                    return ips.map(function (ip) {
                        return {
                            ip: ip,
                            coordinates: self.getRandomCoordinates(layerName)
                        }
                    });
                });
            },
            mapAllIPsToRandomLayerCoordinates: function () {
                var self = this;
                return IPService.loadAllDistricts().then(function (districtNames) {
                    var ipWithCoordinatesPromises = districtNames.data.map(function (districtName) {
                        return self.mapIPsToRandomLayerCoordinates(districtName);
                    });
                    return $q.all(ipWithCoordinatesPromises);
                });
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
            getRandomCoordinates: function (layerName) {
                return LayerMap.getRandomCoordinates(layerName)
            }
        };
    });

    module.directive('map', function (MapService, $window, IPService, DistributionPlanService, MapFilterService, $q, $timeout) {

        function getAllMarkersWithResponses(map, scope) {
            var deferredMarkers = $q.defer();
//            DistributionPlanService.mapUnicefIpsWithConsignees().then(function (ips) {
//                ips.map(function (ip) {
//                    ip.consignees.then(function (consignees) {
//                        consignees.map(function (consignee) {
//                            consignee.answers.then(function (answers) {
//                                var consigneeCoordinates = map.getRandomCoordinates(consignee.consignee.location.toLowerCase());
//                                var markerData = answers;
//                                if (answers.length) {
//                                    var marker = new Marker([consigneeCoordinates.lat, consigneeCoordinates.lng], markerData, scope);
//                                    MapFilterService.setMapMarker({marker: marker, consigneeResponse: markerData});
//                                }
//                            });
//                        });
//                    });
//                });
//            });

            $timeout(function () {
                deferredMarkers.resolve(MapFilterService.getAllMarkerMaps());
            }, 5000);
            return deferredMarkers.promise;
        }

        return {
            scope: false,
            link: function (scope, element, attrs) {

                MapService.render(attrs.id, null, scope).then(function (map) {
                    $window.map = map;
                    scope.filter = {};
                    scope.clickedMarker = '';
                    scope.allMarkers = [];
                    scope.shownMarkers = [];
                    scope.programme = '';
                    scope.notDeliveredChecked = false;
                    scope.deliveredChecked = null;
                    scope.allMarkers = [];

                    DistributionPlanService.aggregateResponses().then(function (aggregates) {
                        scope.totalStats = aggregates;
                    });

                    scope.hideMapMarkerDetails = function () {
                        scope.clickedMarker = null;
                    };

                    getAllMarkersWithResponses(map, scope).then(function (markersMap) {
                        MapService.addMarkers(markersMap);
                    });
                });
            }
        }
    }).directive('panel', function () {
        return {
            scope: true,
            link: function (scope, element, attrs) {
                scope.expanded = true;

                var expandAnimation = JSON.parse(attrs.panelExpand);
                var collapseAnimation = JSON.parse(attrs.panelCollapse);
                var panel = $(element);

                var togglePanel = function () {
                    var $closePanel = $('.close-panel span'),
                        zoomControl = $('.leaflet-control-zoom');
                    if (scope.expanded) {
                        panel.animate(collapseAnimation);
                        scope.expanded = false;
                        $closePanel.removeClass("glyphicon-chevron-down");
                        $closePanel.addClass("glyphicon-chevron-up");
                        zoomControl.addClass('leaflet-control-zoom-left');
                        zoomControl.removeClass('leaflet-control-zoom');

                    } else {
                        panel.animate(expandAnimation);
                        scope.expanded = true;
                        $('.leaflet-control-zoom-left').addClass('leaflet-control-zoom');
                        $closePanel.removeClass("glyphicon-chevron-up");
                        $closePanel.addClass("glyphicon-chevron-down");
                    }
                    return false;
                };
                $(".close-panel").click(function () {
                    togglePanel();
                });
            }
        }
    }).directive('mapFilter', function () {
        return{
            restrict: 'A',
            scope: true,
            templateUrl: '/static/app/views/partials/filters.html'
        }
    }).directive('mapSummary', function () {
        return{
            restrict: 'A',
            scope: true,
            templateUrl: '/static/app/views/partials/marker-summary.html'
        }
    }).directive('selectProgram', function (ProgrammeService, FilterService, DistributionPlanService, $q, MapService, MapFilterService) {
            return {
                restrict: 'A',
                scope: false,
                link: function (scope, elem) {

                    scope.allMarkers = MapFilterService.getAllMarkerMaps();
                    scope.shownmarkers = [];
                    ProgrammeService.fetchProgrammes().then(function (response) {
                        return response.data.map(function (programe) {
                            return {id: programe.id, text: programe.name}
                        });

                    }).then(function (data) {
                        var defaultProgramme = [
                            {id: '', text: 'All Outcomes'}
                        ];
                        $(elem).select2({
                            data: defaultProgramme.concat(data)
                        });
                    });

                    scope.$watchCollection('[programme, ip]', function (filters) {
                        var showMarkers = scope.shownMarkers.length === 0 ? MapFilterService.getAllMarkerMaps() : scope.shownMarkers;

                        var selectedProgramme = filters[0];
                        var selectedIp = filters[1];

                        if (!selectedProgramme && !selectedIp) {
                            scope.updateTotalStats && scope.updateTotalStats();
                            MapService.addAllMarkers();
                            return;
                        }
                        MapService.clearAllMarkers();
                        if (selectedProgramme) {
                            MapFilterService.filterMarkersByProgramme(selectedProgramme, showMarkers).then(function (markerMaps) {
                                scope.shownMarkers = markerMaps;
                                MapService.addMarkers(markerMaps);
                            });
                        }
                        if (selectedIp) {
                            MapFilterService.filterMarkersByIp(selectedIp, showMarkers).then(function (markerMaps) {
                                scope.shownMarkers = markerMaps;
                                MapService.addMarkers(markerMaps);
                            });
                        }

                        scope.updateTotalStats && scope.updateTotalStats({programme: filters[0], consignee: filters[1]});
                    });
                }
            }
        }
    ).directive('selectIP', function (ProgrammeService, FilterService, DistributionPlanService, ConsigneeService, $q) {
            return {
                restrict: 'A',
                link: function (scope, elem) {
                    DistributionPlanService.getAllPlansNodes().then(function (responses) {
                        var ips = responses.filter(function (response) {
                            return !response.data.parent;
                        });
                        var dataPromises = ips.map(function (ip) {
                            return ConsigneeService.getConsigneeById(ip.data.consignee).then(function (consignee) {
                                return {
                                    id: ip.data.id,
                                    text: consignee.name
                                }
                            });
                        });

                        return $q.all(dataPromises);
                    }).then(function (data) {
                        var defaultIP = [
                            {id: '', text: 'All Implementing Partners'}
                        ];
                        $(elem).select2({
                            data: defaultIP.concat(data)
                        });
                    });
                }
            }
        }).directive('deliveryStatus', function (MapService, MapFilterService) {
            return {
                restrict: 'A',
                scope: false,
                link: function (scope) {
                    scope.filter = {received: true, notDelivered: true, receivedWithIssues: true};
                    function addShownMarkers(condition, showMarkers) {
                        scope.shownMarkers = [];
                        showMarkers.forEach(function (markerMap) {
                            if (getNumberOf(condition, markerMap.consigneeResponse).length == markerMap.consigneeResponse.length) {
                                scope.shownMarkers.push(markerMap);
                                MapService.addMarker(markerMap.marker);
                            }
                        });
                    }

                    scope.$watchCollection('[filter.received,filter.notDelivered, filter.receivedWithIssues]', function (newFilterValues) {
                        var showMarkers = scope.shownMarkers.length === 0 ? MapFilterService.getAllMarkerMaps() : scope.shownMarkers;

                        MapService.clearAllMarkers();
                        if (!newFilterValues[0] && !newFilterValues[1] && !newFilterValues[2]) {
                            MapService.clearAllMarkers(scope.shownMarkers);
                        }
                        if (newFilterValues[0]) {
                            addShownMarkers('yes', showMarkers);
                        }
                        if (newFilterValues[1]) {
                            addShownMarkers('no', showMarkers);
                        }
                        if (newFilterValues[2]) {
                            scope.shownMarkers = [];
                            showMarkers.forEach(function (markerMap) {
                                var numberOfNos = getNumberOf('no', markerMap.consigneeResponse).length;
                                if (numberOfNos > 0 && numberOfNos < markerMap.consigneeResponse.length) {
                                    MapService.addMarker(markerMap.marker);
                                    scope.shownMarkers.push(markerMap);
                                }
                            });
                        }
                    });
                }
            }

        }).directive('selectYear', function (FilterService, MapService, MapFilterService) {
            return {
                restrict: 'A',
                scope: false,
                link: function (scope, elem) {
                    FilterService.getDateAnswers().then(function (response) {
                        var dateAnswers = response.data.map(function (answer) {
                            var dateString = answer.value;
                            return dateString && dateString.substring(dateString.length - 4);
                        });

                        return _.unique(dateAnswers);

                    }).then(function (uniqueYear) {
                        var yearsData = uniqueYear.map(function (year) {
                            return { id: year, text: year}
                        });
                        var defaultYear = [
                            {id: '', text: 'Select year'}
                        ];
                        $(elem).select2({
                            data: defaultYear.concat(yearsData)
                        });
                    });
                    scope.$watch('filter.year', function (selectedYear) {

                        var wasAnsweredInYear = function (response) {
                            var dateOfReceipt = response[0].dateOfReceipt;
                            return dateOfReceipt && dateOfReceipt.substring(dateOfReceipt.length - 4) == selectedYear;
                        };

                        var showMarkers = scope.shownMarkers.length === 0 ? MapFilterService.getAllMarkerMaps() : scope.shownMarkers;

                        MapService.clearAllMarkers();
                        if (!selectedYear) {
                            MapService.addMarkers(showMarkers);
                            return;
                        }
                        scope.shownMarkers = [];
                        showMarkers.forEach(function (markerMap) {
                            if (wasAnsweredInYear(markerMap.consigneeResponse)) {
                                MapService.addMarker(markerMap.marker);
                                scope.shownMarkers.push(markerMap);
                            }
                        });
                    }, true);
                }
            }
        }).directive('dateRangeFilter', function (MapService, MapFilterService) {
            return {
                restrict: 'A',
                scope: false,
                link: function (scope) {
                    scope.$watchCollection('[filter.from, filter.to]', function (newDates) {
                        var fromDate = moment(newDates[0]),
                            toDate = moment(newDates[1]),
                            showMarkers = scope.shownMarkers.length === 0 ? MapFilterService.getAllMarkerMaps() : scope.shownMarkers;

                        function isWithinDateRange(consigneeResponse) {
                            var response = consigneeResponse[0],
                                dateOfReceipt = response && response.dateOfReceipt,
                                dateRange = moment().range(fromDate, toDate);
                            return dateOfReceipt && dateRange.contains(moment(dateOfReceipt));
                        }

                        if (newDates[0] && newDates[1]) {
                            MapService.clearAllMarkers();
                            scope.shownMarkers = [];
                            showMarkers.forEach(function (markerMap) {
                                if (isWithinDateRange(markerMap.consigneeResponse)) {
                                    MapService.addMarker(markerMap.marker);
                                    scope.shownMarkers.push(markerMap);
                                }
                            });
                        }
                    });

                    scope.clearFilters = function () {
                        scope.filter = {
                            received: true,
                            notDelivered: true,
                            receivedWithIssues: true,
                            year: '',
                            to: '',
                            from: ''
                        };
                        scope.shownMarkers = [];
                        scope.ip = '';
                        scope.programme = '';
                        scope.updateTotalStats();
                    }
                }
            }

        }).factory('FilterService', function (DistributionPlanService, $http, EumsConfig) {

            var filterPlanById = function (distributionPlans, programmeId) {
                return distributionPlans.data.filter(function (plan) {
                    return plan.programme == programmeId;
                });
            };

            return {
                getDistributionPlansBy: function (programmeId) {
                    return DistributionPlanService.fetchPlans().then(function (allDistributionPlans) {
                        return filterPlanById(allDistributionPlans, programmeId);
                    });
                },
                getDateAnswers: function () {
                    return $http.get(EumsConfig.BACKEND_URLS.DATE_ANSWERS);
                }
            }
        });

})
(angular.module('eums.map', ['eums.config', 'eums.ip', 'Programme', 'DistributionPlan', 'DatePicker', 'eums.mapFilter', 'map.layers']));