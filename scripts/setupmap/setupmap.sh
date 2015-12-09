#!/bin/bash

PARENT_DIR='../'
DATA_DIR='../../eums/client/app/data/'
CONFIG_DIR='../../../eums/client/config/'
EXTRACTOR_DIR='./geojson-feature-name-extractor/'
GEOJSON='districts.json'
GEOJSON_NAMES='district_name.json'

test -f ${DATA_DIR}${GEOJSON} || { echo "Error $0: Map not found"; exit 1; }

#Clone extractor app and get region names
echo 1. Extract region names
test -d ${EXTRACTOR_DIR} || git clone https://github.com/twkampala/geojson-feature-name-extractor.git
cp ${DATA_DIR}${GEOJSON} ${EXTRACTOR_DIR}${GEOJSON}
cd ${EXTRACTOR_DIR}
node ./extractor.js

#Copy to target directory
echo 2. Copy to target directory
rm ${GEOJSON}
mv ${GEOJSON_NAMES} ${PARENT_DIR}${DATA_DIR}${GEOJSON_NAMES}

#Configure constants for map rendering
echo 3. Set constants for map rendering
echo Please type map center latitude
read latitude
echo Please type map center longitude
read longitude
echo Please type map zoom level
read level

cd ${CONFIG_DIR}
sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${latitude}', '${longitude}'],/g' development.json
sed -i.bak -e 's/"ZOOM_LEVEL": \(.*\)/"ZOOM_LEVEL": '${level}'/g' development.json
rm development.json.bak
sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${latitude}', '${longitude}'],/g' environment.json
sed -i.bak -e 's/"ZOOM_LEVEL": \(.*\)/"ZOOM_LEVEL": '${level}'/g' environment.json
rm environment.json.bak
sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${latitude}', '${longitude}'],/g' production.json
sed -i.bak -e 's/"ZOOM_LEVEL": \(.*\)/"ZOOM_LEVEL": '${level}'/g' production.json
rm production.json.bak
sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${latitude}', '${longitude}'],/g' staging.json
sed -i.bak -e 's/"ZOOM_LEVEL": \(.*\)/"ZOOM_LEVEL": '${level}'/g' staging.json
rm staging.json.bak
sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${latitude}', '${longitude}'],/g' test.json
sed -i.bak -e 's/"ZOOM_LEVEL": \(.*\)/"ZOOM_LEVEL": '${level}'/g' test.json
rm test.json.bak

#Run grunt to rebuild static files
echo 4. Rebuild to generate static config file
cd ${PARENT_DIR}
grunt build-staging