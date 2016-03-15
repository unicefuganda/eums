import datetime

downloaded_purchase_orders = [{"PURCHASING_ORG_CODE": "1000",
                               "PURCHASING_GROUP_CODE": u"100",
                               "PURCHASING_GROUP_NAME": "IMMUNIZATION",
                               "PLANT_CODE": "1000",
                               "VENDOR_CODE": "1900000501",
                               "VENDOR_NAME": "P.T. BIO FARMA (PERSERO)",
                               "VENDOR_CTRY_NAME": "Indonesia",
                               "GRANT_REF": "XP154478",
                               "EXPIRY_DATE": u"/Date(1483160400000)/",
                               "DONOR_NAME": "Ministry of National Health",
                               "PREQ_NO": "0030344125",
                               "PREQ_ITEM": 80,
                               "PREQ_QTY": 51322.65,
                               "SO_NUMBER": u"0020173918",
                               "PO_NUMBER": u"0045143984",
                               "PO_ITEM": 10,
                               "PO_TYPE": "NB",
                               "PO_DATE": u"/Date(1448859600000)/",
                               "CREATE_DATE": u"/Date(1448859600000)/",
                               "UPDATE_DATE": u"/Date(1448859600000)/",
                               "PO_ITEM_QTY": 100,
                               "CURRENCY_CODE": "USD",
                               "AMOUNT_CURR": 51322.65,
                               "AMOUNT_USD": 51322.65,
                               "MATERIAL_CODE": "S0141021",
                               "MATERIAL_DESC": "Scale,electronic,mother/child,150kgx100g"}]

converted_purchase_orders = [
    {'AMOUNT_CURR': 51322.65, 'PURCHASING_GROUP_CODE': 100, 'PURCHASING_ORG_CODE': '1000',
     'PREQ_NO': '0030344125',
     'PLANT_CODE': '1000', 'MATERIAL_DESC': 'Scale,electronic,mother/child,150kgx100g',
     'EXPIRY_DATE': datetime.datetime(2016, 12, 31, 8, 0), 'PO_ITEM_QTY': 100, 'PREQ_ITEM': 80,
     'PURCHASING_GROUP_NAME': 'IMMUNIZATION', 'PO_ITEM': 10, 'PO_DATE': datetime.datetime(2015, 11, 30, 8, 0),
     'CREATE_DATE': datetime.datetime(2015, 11, 30, 8, 0), 'UPDATE_DATE': datetime.datetime(2015, 11, 30, 8, 0),
     'VENDOR_CTRY_NAME': 'Indonesia', 'DONOR_NAME': 'Ministry of National Health', 'PREQ_QTY': 51322.65,
     'CURRENCY_CODE': 'USD', 'SO_NUMBER': 20173918, 'VENDOR_CODE': '1900000501', 'AMOUNT_USD': 51322.65,
     'GRANT_REF': 'XP154478', 'PO_NUMBER': 45143984, 'MATERIAL_CODE': 'S0141021', 'PO_TYPE': 'NB',
     'VENDOR_NAME': 'P.T. BIO FARMA (PERSERO)'}]

purchase_order_which_do_not_have_reference_to_sales_order = [
    {'UPDATE_DATE': datetime.datetime(2015, 11, 30, 8, 0),
     'PURCHASING_GROUP_CODE': 100,
     # This so number don't exists in Eums when import this po
     'SO_NUMBER': 20170001,
     'PO_NUMBER': 45143984,
     'PO_TYPE': 'NB',
     'PO_ITEM': 10,
     'MATERIAL_DESC': 'Scale,electronic,mother/child,150kgx100g',
     'AMOUNT_USD': 51322.65,
     'MATERIAL_CODE': 'S0141021',
     'PREQ_ITEM': 80,
     'PO_ITEM_QTY': 100}]

purchase_order_item_which_do_not_have_reference_to_sales_order_item = [
    {'UPDATE_DATE': datetime.datetime(2015, 11, 30, 8, 0),
     'PURCHASING_GROUP_CODE': 100,
     'SO_NUMBER': 20173918,
     'PO_NUMBER': 45143984,
     'PO_TYPE': 'NB',
     'PO_ITEM': 10,
     'MATERIAL_DESC': 'Scale,electronic,mother/child,150kgx100g',
     'AMOUNT_USD': 51322.65,
     'MATERIAL_CODE': 'S0141021',
     # so item number in Eums is 80, but this one is 70, so this item can't refer to so item
     'PREQ_ITEM': 70,
     'PO_ITEM_QTY': 100}]

purchase_order_item_with_invalid_po_type = [
    {'UPDATE_DATE': datetime.datetime(2015, 11, 30, 8, 0),
     'PURCHASING_GROUP_CODE': 100,
     'SO_NUMBER': 20173918,
     'PO_NUMBER': 45143984,
     # For now only NB, ZLC, ZUB, ZOC are supported by Eums
     'PO_TYPE': 'ZAM',
     'PO_ITEM': 10,
     'MATERIAL_DESC': 'Scale,electronic,mother/child,150kgx100g',
     'AMOUNT_USD': 51322.65,
     'MATERIAL_CODE': 'S0141021',
     'PREQ_ITEM': 80,
     'PO_ITEM_QTY': 100}]
