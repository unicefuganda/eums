(function (module) {
    function getNumberOf(receivedCriteria, data) {
        return data.filter(function (answer) {
            return answer.productReceived && answer.productReceived.toLowerCase() === receivedCriteria.toLowerCase();
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

        marker.nodeId = data.id;

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

    function Layer(map, layer, layerOptions) {
        var selected = false;

        function init(self) {
            layer
                .on('mouseover', self.highlight)
                .on('mouseout', self.unhighlight)
                .on('click', self.click);
        }

        this.click = function () {
            map.fitBounds(layer.getBounds());
        };

        this.getLayerBounds = function () {
            return layer.getBounds();
        };

        this.getCenter = function () {
            return layer.getBounds().getCenter();
        };

        this.highlight = function () {
            layer.setStyle(layerOptions.selectedLayerStyle);
            selected = true;
        };

        this.unhighlight = function () {
            layer.setStyle(layerOptions.districtLayerStyle);
            selected = false;
        };

        this.isHighlighted = function () {
            return selected;
        };

        init(this);
    }

    module.factory('LayerMap', function () {
        var layerList = {};

        function getRandomCoordinates(bound) {
            return {
                lat: Math.random() * (bound._northEast.lat - bound._southWest.lat) + bound._southWest.lat,
                lng: Math.random() * (bound._northEast.lng - bound._southWest.lng) + bound._southWest.lng
            }
        }

        return {
            addLayer: function (layer, layerName) {
                layerList[layerName] = layer;
            },
            getLayer: function (layerName) {
                return layerList[layerName.toLowerCase()];
            },
            getRandomCoordinates: function (layerName) {
                var bound = this.getLayerBoundsBy(layerName);
                return getRandomCoordinates(bound)
            },
            getLayerBoundsBy: function (layerName) {
                return this.getLayer(layerName).getLayerBounds();
            },
            getLayerCenter: function (layerName) {
                return layerList[layerName].getCenter();
            },
            getSelectedLayer: function () {
                var highlightedLayer = {};
                angular.forEach(layerList, function (layer, layerName) {
                    if (layer.isHighlighted()) {
                        highlightedLayer[layerName] = layer;
                    }
                });
                return highlightedLayer;
            },
            selectLayer: function (layerName) {
                layerList[layerName].highlight();
            },
            clickLayer: function (layerName) {
                layerList[layerName].click();
            }
        }
    });

    module.factory('GeoJsonService', function ($http, EumsConfig) {
        return {
            districts: function () {
                return $http.get(EumsConfig.DISTRICTGEOJSONURL, {cache: true});
            }
        }
    });


    module.factory('MapService', function (GeoJsonService, EumsConfig, LayerMap, IPService, $q) {
        var map;

        function initMap(elementId) {
            var map = L.map(elementId, {
                zoomControl: true,
                scrollWheelZoom: false,
                touchZoom: false,
                doubleClickZoom: false,
            }).setView([1.436, 32.884], 7);

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

        function addDistrictsLayer(map) {
            return GeoJsonService.districts().then(function (response) {
                L.geoJson(response.data, {
                    style: EumsConfig.districtLayerStyle,
                    onEachFeature: function (feature, layer) {
                        var districtLayer = new Layer(map, layer, EumsConfig);
                        var districtName = feature.properties.DNAME_2010 || 'unknown';
                        LayerMap.addLayer(districtLayer, districtName.toLowerCase())
                    }
                }).addTo(map);
            });
        }

        return {
            render: function (elementId, layerName) {
                map = initMap(elementId);

                return addDistrictsLayer(map).then(function () {
                    layerName && this.clickLayer(layerName);
                    return this;
                }.bind(this));
            },
            getZoom: function () {
                return map.getZoom();
            },
            getCenter: function () {
                return map.getCenter();
            },
            addMarker: function (marker) {
                return addIPMarker(marker);
            },
            removeMarker: function (marker) {
                map.removeLayer(marker);
            },
            clearAllMarkers: function (scope) {
                var self = this,
                    allMarkers = scope.allMarkers;

                allMarkers && allMarkers.forEach(function (markerNodeMap) {
                    self.removeMarker(markerNodeMap.marker);
                });
            },

            addMarkers: function (scope) {
                var self = this,
                    allMarkers = scope.allMarkers;

                allMarkers && allMarkers.forEach(function (markerNodeMap) {
                    self.addMarker(markerNodeMap.marker);
                });
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
            clickLayer: function (layerName) {
                if (layerName) {
                    LayerMap.clickLayer(layerName.toLowerCase());
                    this.highlightLayer(layerName);
                }
            },
            getRandomCoordinates: function (layerName) {
                return LayerMap.getRandomCoordinates(layerName)
            }
        };
    });

    module.directive('map', function (MapService, $window, IPService, DistributionPlanService, $q, $timeout) {
        return {
            scope: true,
            link: function (scope, element, attrs) {
                MapService.render(attrs.id, null).then(function (map) {
                    $window.map = map;
                    scope.filter = {};
                    scope.clickedMarker = '';
                    scope.allMarkers = [];
                    scope.shownMarkers = [];
                    scope.programme = '';
                    scope.notDeliveredChecked = false;
                    scope.deliveredChecked = null;

                    DistributionPlanService.mapUnicefIpsWithConsignees().then(function (ips) {
                        ips.map(function (ip) {
                            ip.consignees().then(function (consigneesResponses) {
                                consigneesResponses.map(function (consigneesResponse) {
                                    var consigneeCoordinates = map.getRandomCoordinates(consigneesResponse.data.location.toLowerCase());
                                    DistributionPlanService.getConsigneeDetails(consigneesResponse.data.id).then(function (response) {
                                        var markerData = JSON.parse(JSON.parse(response.data));
                                        var marker = new Marker([consigneeCoordinates.lat, consigneeCoordinates.lng], markerData, scope);
                                        var consigneeResponse = markerData[0];
                                        consigneeResponse && map.addMarker(marker) && scope.allMarkers.push({marker: marker, consigneeResponse: markerData});
                                    });
                                });
                            });
                        });
                    });
                    scope.$watch('params.location', function (newLocation) {
                        newLocation && MapService.clickLayer(newLocation.district);
                    }, true);
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
    }).directive('selectProgram', function (ProgrammeService, FilterService, DistributionPlanService, $q, MapService) {
            return {
                restrict: 'A',
                scope: true,
                link: function (scope, elem) {
                    scope.shownMarkers = [];
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


                    function addSelectedMarker(node) {
                        scope.shownMarkers = [];
                        scope.allMarkers.forEach(function (markerNodeMap) {
                            if (markerNodeMap.consigneeResponse[0].node == node.data.id) {
                                scope.shownMarkers.push(markerNodeMap);
                                MapService.addMarker(markerNodeMap.marker);
                            }
                        });
                    }

                    scope.$watch('programme', function (newProgramme) {
                        if (newProgramme == '') {
                            MapService.addMarkers(scope);
                        } else {
                            FilterService.getDistributionPlansBy(newProgramme).then(function (selectedProgramsPlans) {
                                    var selectedPlanNodes = selectedProgramsPlans.map(function (plan) {
                                        return DistributionPlanService.getNodes(plan)
                                    });

                                    var noneEmptyNodes = function (filteredNodes) {
                                        return filteredNodes.filter(function (nodes) {
                                            return nodes.length > 0;
                                        });
                                    };
                                    $q.all(selectedPlanNodes).then(function (filteredNodes) {
                                        MapService.clearAllMarkers(scope);
                                        var nonempty = noneEmptyNodes(filteredNodes)[0];
                                        nonempty && nonempty.map(function (node) {
                                            addSelectedMarker(node);
                                        });
                                    });
                                }
                            );
                            scope.updateTotalStats({programme: newProgramme});
                        }
                    });
                }
            }
        }
    ).directive('selectIP', function (ProgrammeService, FilterService, DistributionPlanService, ConsigneeService, $q, MapService) {
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

                    scope.$watch('ip', function (selectedIp) {
                        if (selectedIp === '') {
                            MapService.addMarkers(scope);
                        } else {
                            var newShownMarkers = [];
                            var shownMarkers = scope.shownMarkers;

                            if (shownMarkers.length === 0) {
                                shownMarkers = scope.allMarkers;
                            }

                            DistributionPlanService.getNodesBy(selectedIp).then(function (data) {
                                MapService.clearAllMarkers(scope);
                                data.map(function (node) {
                                    shownMarkers && shownMarkers.forEach(function (markerMap) {
                                        if (markerMap.consigneeResponse[0].node == node.data.id) {
                                            MapService.addMarker(markerMap.marker);
                                            newShownMarkers.push(markerMap);
                                        }
                                    });
                                });
                                scope.shownMarkers = newShownMarkers;
                            });
                            scope.updateTotalStats && scope.updateTotalStats({consignee: selectedIp});
                        }
                    });

                }
            }
        }).directive('deliveryStatus', function (MapService) {
            return {
                restrict: 'A',
                scope: false,
                link: function (scope) {
                    scope.filter = {received: true, notDelivered: true, receivedWithIssues: true};
                    function addShownMarkers(condition, showMarkers) {
                        showMarkers.forEach(function (markerMap) {
                            if (getNumberOf(condition, markerMap.consigneeResponse).length == markerMap.consigneeResponse.length) {
                                MapService.addMarker(markerMap.marker);
                            }
                        });
                    }

                    scope.$watchCollection('[filter.received,filter.notDelivered, filter.receivedWithIssues]', function (newFilterValues) {
                        var showMarkers = scope.shownMarkers.length > 0 ? scope.shownMarkers : scope.allMarkers;

                        MapService.clearAllMarkers(scope);
                        if (!newFilterValues[0] && !newFilterValues[1] && !newFilterValues[2]) {
                            MapService.clearAllMarkers(scope);
                        }
                        if (newFilterValues[0]) {
                            addShownMarkers('yes', showMarkers);
                        }
                        if (newFilterValues[1]) {
                            addShownMarkers('no', showMarkers);
                        }
                        if (newFilterValues[2]) {
                            showMarkers.forEach(function (markerMap) {
                                var numberOfNos = getNumberOf('no', markerMap.consigneeResponse).length;
                                if (numberOfNos > 0 && numberOfNos < markerMap.consigneeResponse.length) {
                                    MapService.addMarker(markerMap.marker);
                                }
                            });
                        }
                    });
                }
            }

        }).directive('selectYear', function (FilterService, MapService) {
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

                        var showMarkers = scope.shownMarkers.length > 0 ? scope.shownMarkers : scope.allMarkers;
                        MapService.clearAllMarkers(scope);
                        if (!selectedYear) {
                            MapService.addMarkers(scope);
                        }
                        showMarkers.forEach(function (markerMap) {
                            if (wasAnsweredInYear(markerMap.consigneeResponse)) {
                                MapService.addMarker(markerMap.marker);
                            }
                        });
                    }, true);
                }
            }
        }).directive('dateRangeFilter', function (MapService) {
            return {
                restrict: 'A',
                scope: false,
                link: function (scope) {
                    scope.$watchCollection('[filter.from, filter.to]', function (newDates) {
                        var fromDate = moment(newDates[0]),
                            toDate = moment(newDates[1]),
                            showMarkers = scope.shownMarkers.length > 0 ? scope.shownMarkers : scope.allMarkers;

                        function isWithinDateRange(consigneeResponse) {
                            var response = consigneeResponse[0],
                                dateOfReceipt = response && response.dateOfReceipt,
                                dateRange = moment().range(fromDate, toDate);
                            console.log(dateRange.contains(moment(dateOfReceipt)));
                            return dateOfReceipt && dateRange.contains(moment(dateOfReceipt));
                        }

                        if (newDates[0] && newDates[1]) {
                            MapService.clearAllMarkers(scope);
                            showMarkers.forEach(function (markerMap) {
                                if (isWithinDateRange(markerMap.consigneeResponse)) {
                                    MapService.addMarker(markerMap.marker);
                                }
                            });
                        }
                    });

                    scope.clearFilters = function () {
                        scope.filter = {received: true, notDelivered: true, receivedWithIssues: true, year: '', to: '', from: ''};
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
(angular.module('eums.map', ['eums.config', 'eums.ip', 'Programme', 'DistributionPlan', 'DatePicker']));