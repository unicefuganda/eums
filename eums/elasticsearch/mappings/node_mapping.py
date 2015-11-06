DELIVERY_NODE_MAPPING = {
    "delivery_node": {
        "properties": {
            "balance": {
                "type": "long"
            },
            "responses": {
                "properties": {
                    "value": {
                        "type": "string",
                        "index": "not_analyzed"
                    }
                }
            },
            "item": {
                "type": "string",
                "fields": {
                    "quantity": {
                        "type": "long"
                    }
                }
            },
            "location": {
                "type": "string",
                "index": "not_analyzed"
            },
            "tree_position": {
                "type": "string",
                "index": "not_analyzed"
            },
            "total_value": {
                "type": "double"
            },
            "value_lost": {
                "type": "double"
            },
            "delivery_delay": {
                "type": "long"
            }
        }
    }
}
