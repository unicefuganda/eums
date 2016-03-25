ddescribe('Supply Efficiency Service', function () {
    var mockBackend, service, config, queries, esEndpoint;
    var stubReportResponse = [
        {
            identifier: {
                "programme": {
                    "name": ""
                },
                "order_item": {
                    "order": {
                        "order_number": 81026395,
                        "order_type": "purchase_order"
                    },
                    "item": {
                        "description": "Children's Rights & Busi Principles Info",
                        "material_code": "SL004638"
                    }
                },
                "location": "M",
                "delivery_date": "2015-10-11",
                "ip": {
                    "name": "WAKISO DHO"
                }
            },
            delivery_stages: {
                unicef: {
                    total_value: 954
                },
                ip_receipt: {
                    total_value_received: 854,
                    confirmed: 89,
                    average_delay: 8
                },
                ip_distribution: {
                    total_value_distributed: 42,
                    balance: 811
                },
                end_user: {
                    total_value_received: 5,
                    confirmed: 0,
                    average_delay: -2
                }
            }
        },
        {
            identifier: {
                "programme": {
                    "name": ""
                },
                "order_item": {
                    "order": {
                        "order_number": 54119455,
                        "order_type": "release_order"
                    },
                    "item": {
                        "description": "Laptop bag",
                        "material_code": "SL002248"
                    }
                },
                "location": "Buliisa",
                "delivery_date": "2015-01-12",
                "ip": {
                    "name": "WAKISO DHO"
                }
            },
            delivery_stages: {
                unicef: {
                    total_value: 3320
                },
                ip_receipt: {
                    total_value_received: 3320,
                    confirmed: 100,
                    average_delay: 274
                },
                ip_distribution: {
                    total_value_distributed: 3216,
                    balance: 104
                },
                end_user: {
                    total_value_received: 0,
                    confirmed: 0,
                    average_delay: 0
                }
            }
        }
    ];

    beforeEach(function () {
        module('SupplyEfficiencyReport');
        inject(function (SupplyEfficiencyReportService, $httpBackend, EumsConfig, Queries) {
            service = SupplyEfficiencyReportService;
            mockBackend = $httpBackend;
            config = EumsConfig;
            queries = Queries;
            esEndpoint = EumsConfig.BACKEND_URLS.SUPPLY_EFFICIENCY_REPORT;
        });
    });

    it('should have the right view to es filter mappings', function () {
        var views = service.VIEWS;
        expect(views.DELIVERY).toEqual('distribution_plan_id');
        expect(views.ITEM).toEqual('order_item.item.id');
        expect(views.LOCATION).toEqual('location');
        expect(views.OUTCOME).toEqual('programme.id');
        expect(views.IP).toEqual('ip.id');
        expect(views.DOCUMENT).toEqual('order_item.order.order_number');
    });

    it('should fetch unfiltered report by delivery when view is delivery', function (done) {
        var expectedQuery = queries.makeQuery("distribution_plan_id", [{exists: {field: 'distribution_plan_id'}}]);
        mockBackend.whenPOST(esEndpoint, expectedQuery).respond(stubReportResponse);

        service.generate(service.VIEWS.DELIVERY, {}).then(function (actualReport) {
            actualReport.forEach(function (bucket) {
                var index = actualReport.indexOf(bucket);
                expect(bucket.identifier).toEqual(stubReportResponse[index].identifier);
                expect(bucket.delivery_stages.unicef).toEqual(stubReportResponse[index].delivery_stages.unicef);
                expect(bucket.delivery_stages.ip_receipt).toEqual(stubReportResponse[index].delivery_stages.ip_receipt);
                expect(bucket.delivery_stages.ip_distribution).toEqual(stubReportResponse[index].delivery_stages.ip_distribution);
                expect(bucket.delivery_stages.end_user).toEqual(stubReportResponse[index].delivery_stages.end_user);
            });
            done();
        });
        mockBackend.flush();
    });

    iit('should filter report by filters specified when generating query', function () {
        var filters = {
            consignee: 1, item: 2, programme: 3, orderNumber: 4, location: 'wakiso',
            startDate: new Date(2015, 0, 10), endDate: new Date(2015, 3, 8)
        };
        spyOn(queries, 'makeQuery');
        mockBackend.whenPOST(esEndpoint, queries.makeQuery()).respond(stubReportResponse);
        service.generate(service.VIEWS.DELIVERY, filters);

        var callArgs = queries.makeQuery.calls.mostRecent().args;
        var generalFilters = callArgs[1];

        expect(callArgs).toContain('distribution_plan_id');
        expect(generalFilters).toContain({term: {'ip.id': 1}});
        expect(generalFilters).toContain({term: {'order_item.item.id': 2}});
        expect(generalFilters).toContain({term: {'programme.id': 3}});
        expect(generalFilters).toContain({term: {'order_item.order.order_number': 4}});
        expect(generalFilters).toContain({term: {'delivery.location': 'wakiso'}});
        expect(generalFilters).toContain({
            range: {
                'delivery.delivery_date': {
                    "gte": "2015-01-10",
                    "lte": "2015-04-08",
                    "format": "yyyy-MM-dd"
                }
            }
        });
        mockBackend.flush();
    });

    it('should construct correct query based on parameters', function () {
        var groupBy = "distribution_plan_id";
        var generalFilters = [{"term": {"location": "Buliisa"}}];
        var query = queries.makeQuery(groupBy, generalFilters);

        expect(query.aggs.deliveries.terms).toEqual({"field": groupBy, "size": 0});
        expect(query.aggs.deliveries.aggs.delivery_stages.aggs).toEqual({
            "total_value_delivered": {"sum": {"field": "total_value"}},
            "total_loss": {"sum": {"field": "value_lost"}},
            "average_delay": {"avg": {"field": "delivery_delay"}}
        });

        var stage_filters = query.aggs.deliveries.aggs.delivery_stages.filters.filters;
        expect(stage_filters.ip.bool.must).toEqual([{"term": {"tree_position": "IMPLEMENTING_PARTNER"}}]);
        expect(stage_filters.distributed_by_ip.bool.must).toEqual([{"term": {"is_directly_under_ip": true}}]);
        expect(stage_filters.end_users.bool.must).toEqual([{"term": {"tree_position": "END_USER"}}]);

        expect(query.aggs.deliveries.aggs.identifier.top_hits).toEqual({
            "size": 1,
            "_source": ["ip.name", "delivery_date", "location", "order_item.item.description",
                "order_item.item.material_code", "programme.name", "order_item.order.order_number",
                "order_item.order.order_type", "delivery.location", "delivery.delivery_date"]
        });
        expect(query.query.filtered.filter.bool.must).toEqual(generalFilters);
    });
});
