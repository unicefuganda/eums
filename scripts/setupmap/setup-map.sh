#!/bin/bash

LATITUDE=$1
LONGITUDE=$2
ZOOM_LEVEL=$3

echo 'Process the map file'
if [ -f /opt/map/districts.json ]; then
    #Clone extractor app and get region names
    echo 'Extract region names'
    mv /opt/map/districts.json /opt/scripts/setupmap/geojson-feature-name-extractor/districts.json
    cd /opt/scripts/setupmap/geojson-feature-name-extractor
    node ./extractor.js

    #Copy to target directory
    echo Copy to target directory
    cp districts.json /opt/app/eums/eums/client/app/data/districts.json
    cp district_name.json /opt/app/eums/eums/client/app/data/district_name.json

    #Set map constant
    cd /opt/app/eums/eums/client/config
    sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${LATITUDE}', '${LONGITUDE}'],/g' development.json
    sed -i.bak -e 's/"ZOOM_LEVEL": \(.*\)/"ZOOM_LEVEL": '${ZOOM_LEVEL}'/g' development.json
    sed -i.bak -e 's/"DISTRICT_NAME_LOCATOR": \(.*\)/"DISTRICT_NAME_LOCATOR": "name"/g' development.json
    rm development.json.bak
    sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${LATITUDE}', '${LONGITUDE}'],/g' environment.json
    sed -i.bak -e 's/"ZOOM_LEVEL": \(.*\)/"ZOOM_LEVEL": '${ZOOM_LEVEL}'/g' environment.json
    sed -i.bak -e 's/"DISTRICT_NAME_LOCATOR": \(.*\)/"DISTRICT_NAME_LOCATOR": "name"/g'  environment.json
    rm environment.json.bak
    sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${LATITUDE}', '${LONGITUDE}'],/g' production.json
    sed -i.bak -e 's/"ZOOM_LEVEL": \(.*\)/"ZOOM_LEVEL": '${ZOOM_LEVEL}'/g' production.json
    sed -i.bak -e 's/"DISTRICT_NAME_LOCATOR": \(.*\)/"DISTRICT_NAME_LOCATOR": "name"/g'  production.json
    rm production.json.bak
    sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${LATITUDE}', '${LONGITUDE}'],/g' staging.json
    sed -i.bak -e 's/"ZOOM_LEVEL": \(.*\)/"ZOOM_LEVEL": '${ZOOM_LEVEL}'/g' staging.json
    sed -i.bak -e 's/"DISTRICT_NAME_LOCATOR": \(.*\)/"DISTRICT_NAME_LOCATOR": "name"/g'  staging.json
    rm staging.json.bak
    sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${LATITUDE}', '${LONGITUDE}'],/g' test.json
    sed -i.bak -e 's/"ZOOM_LEVEL": \(.*\)/"ZOOM_LEVEL": '${ZOOM_LEVEL}'/g' test.json
    sed -i.bak -e 's/"DISTRICT_NAME_LOCATOR": \(.*\)/"DISTRICT_NAME_LOCATOR": "name"/g'  test.json
    rm test.json.bak
fi