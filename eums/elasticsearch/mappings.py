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
            }
        }
    }
}
