'use strict';

angular.module('SupplyEfficiencyQueries', [])
    .factory('Queries', function () {
        return {
            makeQuery: function (groupBy, generalFilters) {
                var defaultGeneralFilters = [{"exists": {"field": "distribution_plan_id"}}];

                return {
                    "query": {
                        "filtered": {
                            "filter": {
                                "bool": {
                                    "must": generalFilters || defaultGeneralFilters
                                }
                            }
                        }
                    },
                    "aggs": {
                        "deliveries": {
                            "terms": {
                                "field": groupBy || "distribution_plan_id",
                                "size": 0
                            },
                            "aggs": {
                                "delivery_stages": {
                                    "filters": {
                                        "filters": {
                                            "ip": {
                                                "bool": {
                                                    "must": [
                                                        {"term": {"tree_position": "IMPLEMENTING_PARTNER"}}
                                                    ]
                                                }
                                            },
                                            "distributed_by_ip": {
                                                "bool": {
                                                    "must": [
                                                        {"term": {"is_directly_under_ip": true}}
                                                    ]
                                                }
                                            },
                                            "end_users": {
                                                "bool": {
                                                    "must": [
                                                        {"term": {"tree_position": "END_USER"}}
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    "aggs": {
                                        "total_value_delivered": {"sum": {"field": "total_value"}},
                                        "total_loss": {"sum": {"field": "value_lost"}},
                                        "average_delay": {"avg": {"field": "delivery_delay"}}
                                    }
                                },
                                "identifier": {
                                    "top_hits": {
                                        "size": 1,
                                        "_source": ["ip.name", "delivery_date", "location", "order_item.item.description", "order_item.item.material_code", "programme.name", "order_item.order.order_number", "order_item.order.order_type"]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
