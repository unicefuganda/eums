DELIVERY_NODE_MAPPING = {
    "delivery_node": {
        "properties": {
            "balance": {
                "type": "integer"
            },
            "responses": {
                "properties": {
                    "value": {"type": "string"}
                }
            },
            "item": {
                "type": "string",
                "fields": {
                    "quantity": {
                        "type": "integer"
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
                "type": "float"
            },
            "value_lost": {
                "type": "float"
            },
            "delivery_delay": {
                "type": "integer"
            }
        }
    }
}
