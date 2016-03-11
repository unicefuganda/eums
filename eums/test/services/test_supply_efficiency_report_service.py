import json

import requests_mock
from django.test import TestCase
from eums.services.supply_efficiency_report_service import SupplyEfficiencyReportService


class SupplyEfficiencyReportServiceTest(TestCase):
    def setUp(self):
        self.stub_es_request = {
            "query": {
                "filtered": {
                    "filter": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "location": "Agago"
                                    }
                                },
                                {
                                    "range": {
                                        "delivery_date": {
                                            "gte": "0201-01-01",
                                            "lte": "2016-12-31",
                                            "format": "yyyy-MM-dd"
                                        }
                                    }
                                },
                                {
                                    "exists": {
                                        "field": "distribution_plan_id"
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            "aggs": {
                "deliveries": {
                    "terms": {
                        "field": "distribution_plan_id",
                        "size": 0
                    }
                }
            }
        }

        self.stub_es_response_data = {
            "took": 1,
            "timed_out": False,
            "_shards": {
                "total": 5,
                "successful": 5,
                "failed": 0
            },
            "hits": {
                "total": 2,
                "max_score": 0,
                "hits": []
            },
            "aggregations": {
                "deliveries": {
                    "doc_count_error_upper_bound": 0,
                    "sum_other_doc_count": 0,
                    "buckets": [
                        {
                            "key": 29,
                            "doc_count": 1,
                            "identifier": {
                                "hits": {
                                    "total": 1,
                                    "max_score": 1,
                                    "hits": [
                                        {
                                            "_index": "eums",
                                            "_type": "delivery_node",
                                            "_id": "39",
                                            "_score": 1,
                                            "_source": {
                                                "delivery": {
                                                    "delivery_date": "2015-11-29",
                                                    "location": "Agago"
                                                },
                                                "delivery_date": "2015-11-29",
                                                "order_item": {
                                                    "item": {
                                                        "description": "IEHK2006,kit,suppl.1-drugs",
                                                        "material_code": "S9906623"
                                                    },
                                                    "order": {
                                                        "order_number": 201443,
                                                        "order_type": "purchase_order"
                                                    }
                                                },
                                                "ip": {
                                                    "name": "WAKISO DHO"
                                                },
                                                "location": "Agago",
                                                "programme": {
                                                    "name": "YI106 - PCR 2 KEEP CHILDREN LEARNING"
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            "delivery_stages": {
                                "buckets": {
                                    "ip": {
                                        "doc_count": 1,
                                        "average_delay": {
                                            "value": 6
                                        },
                                        "total_value_delivered": {
                                            "value": 4.47
                                        },
                                        "total_loss": {
                                            "value": 0
                                        }
                                    },
                                    "distributed_by_ip": {
                                        "doc_count": 0,
                                        "average_delay": {
                                            "value": None
                                        },
                                        "total_value_delivered": {
                                            "value": 0
                                        },
                                        "total_loss": {
                                            "value": 0
                                        }
                                    },
                                    "end_users": {
                                        "doc_count": 0,
                                        "average_delay": {
                                            "value": None
                                        },
                                        "total_value_delivered": {
                                            "value": 0
                                        },
                                        "total_loss": {
                                            "value": 0
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }

    @requests_mock.mock()
    def test_should_get_reports_from_es(self, m):
        m.post(SupplyEfficiencyReportService.es_service_url(), text=json.dumps(self.stub_es_response_data))
        results = SupplyEfficiencyReportService.search_reports({})
        print("RES: %s" % results)
        self.assertEqual(len(results), 1)

    def test_should_parse_report_type_from_request(self):
        report_type = SupplyEfficiencyReportService.parse_report_type(self.stub_es_request)
        self.assertEqual(report_type, "delivery")
