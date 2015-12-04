#!/bin/bash

[ $# -eq 0 ] && { echo "Error $0: Map not specified"; exit 1; }

test -d $1 || { echo "Error $0: Map not found"; exit 1; }

MAP_DIR='./'$1'/'
SHAPEFILE=${MAP_DIR}$1'.shp'
ORIGINAL_GEOJSON=${MAP_DIR}$1'.json'
GEOJSON='districts.json'
EXTRACTOR_DIR='./geojson-feature-name-extractor/'
GEOJSON_NAMES='district_name.json'
RATIO=${2-2}'%'
DATA_DIR='../../../eums/client/app/data/'
CONFIG_DIR='../../../eums/client/config/'

#Convert Shapefile to GeoJSON file
echo 1. Convert shapefile to GeoJson file
if [ -f ${ORIGINAL_GEOJSON} ]; then
    rm ${ORIGINAL_GEOJSON}
fi
ogr2ogr -f GeoJSON -progress -t_srs crs:84 ${ORIGINAL_GEOJSON} ${SHAPEFILE}
#ogrinfo ${ORIGINAL_GEOJSON} OGRGeoJSON

#Simplify GeoJSON to a size under 500K
echo 2. Simplify GeoJson file
mapshaper ${ORIGINAL_GEOJSON} -simplify ${RATIO} cartesian keep-shapes -o ${GEOJSON}

#Clone extractor app and get region names
echo 3. Extract region names
test -d ${EXTRACTOR_DIR} || git clone https://github.com/twkampala/geojson-feature-name-extractor.git
mv ${GEOJSON} ${EXTRACTOR_DIR}${GEOJSON}
cd ${EXTRACTOR_DIR}
node ./extractor.js

#Copy to target directory
echo 4. Copy to target directory
cp ${GEOJSON} ${DATA_DIR}${GEOJSON}
cp ${GEOJSON_NAMES} ${DATA_DIR}${GEOJSON_NAMES}

#Configure constants for map rendering
echo 5. Set constants for map rendering
echo Please type map center latitude
read latitude
echo Please type map center longitude
read longitude

cd ${CONFIG_DIR}
sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${latitude}', '${longitude}'],/g' development.json
rm development.json.bak
sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${latitude}', '${longitude}'],/g' environment.json
rm environment.json.bak
sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${latitude}', '${longitude}'],/g' production.json
rm production.json.bak
sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${latitude}', '${longitude}'],/g' staging.json
rm staging.json.bak
sed -i.bak -e 's/"CENTER": \[\(.*\), \(.*\)\],/"CENTER": \['${latitude}', '${longitude}'],/g' test.json
rm test.json.bak
