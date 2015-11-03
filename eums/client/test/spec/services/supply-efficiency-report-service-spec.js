describe('Supply Efficiency Service', function () {
    var mockBackend, service, config, queries;
    var fakeResponse = {
        aggregations: {
            deliveries: {
                "buckets": [
                    {
                        "key": 16,
                        "doc_count": 10,
                        "identifier": {
                            "hits": {
                                "total": 10,
                                "max_score": 1,
                                "hits": [
                                    {
                                        "_index": "eums",
                                        "_type": "delivery_node",
                                        "_id": "23",
                                        "_score": 1,
                                        "_source": {
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
                                        }
                                    }
                                ]
                            }
                        },
                        "delivery_stages": {
                            "buckets": {
                                "ip": {
                                    "doc_count": 5,
                                    "total_value_delivered": {
                                        "value": 954.0999984741211
                                    },
                                    "total_loss": {
                                        "value": 100.009999999776482582
                                    },
                                    "average_delay": {
                                        "value": 8
                                    }
                                },
                                "distributed_by_ip": {
                                    "doc_count": 2,
                                    "total_value_delivered": {
                                        "value": 42.34999942779541
                                    },
                                    "total_loss": {
                                        "value": 0
                                    },
                                    "average_delay": {
                                        "value": 0
                                    }
                                },
                                "end_users": {
                                    "doc_count": 1,
                                    "total_value_delivered": {
                                        "value": 5.349999904632568
                                    },
                                    "total_loss": {
                                        "value": 0
                                    },
                                    "average_delay": {
                                        "value": -2
                                    }
                                }
                            }
                        }
                    },
                    {
                        "key": 1,
                        "doc_count": 6,
                        "identifier": {
                            "hits": {
                                "total": 6,
                                "max_score": 1,
                                "hits": [
                                    {
                                        "_index": "eums",
                                        "_type": "delivery_node",
                                        "_id": "4",
                                        "_score": 1,
                                        "_source": {
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
                                        }
                                    }
                                ]
                            }
                        },
                        "delivery_stages": {
                            "buckets": {
                                "ip": {
                                    "doc_count": 3,
                                    "total_value_delivered": {
                                        "value": 3320.110008239746
                                    },
                                    "total_loss": {
                                        "value": 0
                                    },
                                    "average_delay": {
                                        "value": 274
                                    }
                                },
                                "distributed_by_ip": {
                                    "doc_count": 2,
                                    "total_value_delivered": {
                                        "value": 3216.1000061035156
                                    },
                                    "total_loss": {
                                        "value": 0
                                    },
                                    "average_delay": {
                                        "value": 2
                                    }
                                },
                                "end_users": {
                                    "doc_count": 0,
                                    "total_value_delivered": {
                                        "value": 0
                                    },
                                    "total_loss": {
                                        "value": 0
                                    },
                                    "average_delay": {
                                        "value": null
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        }
    };


    beforeEach(function () {
        module('SupplyEfficiencyReport');
        inject(function (SupplyEfficiencyReportService, $httpBackend, EumsConfig, Queries) {
            service = SupplyEfficiencyReportService;
            mockBackend = $httpBackend;
            config = EumsConfig;
            queries = Queries;
        });
    });

    it('should fetch unfiltered report by delivery when view is delivery', function (done) {
        var expectedReport = [
            {
                identifier: fakeResponse.aggregations.deliveries.buckets[0].identifier.hits.hits.first()._source,
                delivery_stages: {
                    unicef: {
                        total_value: '954'
                    },
                    ip_receipt: {
                        total_value_received: '854',
                        total_loss: '100',
                        average_delay: 8
                    },
                    ip_distribution: {
                        total_value_distributed: '42',
                        balance: '812'
                    },
                    end_user: {
                        total_value_received: '5',
                        total_loss: '0',
                        average_delay: -2
                    }
                }
            },
            {
                identifier: fakeResponse.aggregations.deliveries.buckets[1].identifier.hits.hits.first()._source,
                delivery_stages: {
                    unicef: {
                        total_value: '3320'
                    },
                    ip_receipt: {
                        total_value_received: '3320',
                        total_loss: '0',
                        average_delay: 274
                    },
                    ip_distribution: {
                        total_value_distributed: '3216',
                        balance: '104'
                    },
                    end_user: {
                        total_value_received: '0',
                        total_loss: '0',
                        average_delay: null
                    }
                }
            }
        ];

        var url = config.ELASTIC_SEARCH_URL + '_search?search_type=count';
        mockBackend.whenPOST(url, queries.baseQuery).respond(fakeResponse);

        service.generate(service.VIEWS.DELIVERY, {}).then(function (actualReport) {
            assertReportsAreEqual(actualReport, expectedReport);
            done();
        });
        mockBackend.flush();
    });

    function assertReportsAreEqual(actualReport, expectedReport) {
        actualReport.forEach(function (bucket) {
            var index = actualReport.indexOf(bucket);
            expect(bucket.identifier).toEqual(expectedReport[index].identifier);
            expect(bucket.delivery_stages.unicef).toEqual(expectedReport[index].delivery_stages.unicef);
            expect(bucket.delivery_stages.ip_receipt).toEqual(expectedReport[index].delivery_stages.ip_receipt);
            expect(bucket.delivery_stages.ip_distribution).toEqual(expectedReport[index].delivery_stages.ip_distribution);
            expect(bucket.delivery_stages.end_user).toEqual(expectedReport[index].delivery_stages.end_user);
        });
    }

    it('should use correct base query', function () {
        var query = queries.baseQuery;
        expect(query.aggs.deliveries.terms).toEqual({"field": "distribution_plan_id", "size": 0});

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
                "order_item.order.order_type"
            ]
        });

        expect(query.filter.bool.must).toEqual([{"exists": {"field": "distribution_plan_id"}}]);
    })
});
