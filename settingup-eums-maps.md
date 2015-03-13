Setting up eums map for a new country depolyment: Case study Rwanda.
---
## NOTE
This guide is specifically for customising the map/dashboard.  For details on how to setup the project please refer to the [Project README] (https://github.com/unicefuganda/eums).

#### 1. Pre-requisites
* GDAL (GeoSpatial Data Abstraction Library)
	* For Mac OSX - Install this by running `brew install gdal`
	* Instructions on building and installing this for other operating systems can be found [here] (http://www.gdal.org/wince.html) for Windows  and [here] (http://www.sarasafavi.com/installing-gdalogr-on-ubuntu.html) for Ubuntu Linux.
	* Acquire the countries shape files. In this case, Rwanda's shape files can be found on the [National Institute of Statistics Rwanda] (http://www.statistics.gov.rw/geodata) website.


####2. Converting the shape file to geoJSON
Installing `gdal` will give you a commandline tool known as `ogr2ogr` which enables you to convert shape (`.shp`) files to geoJSON `.json` or `.geojson`.


####Steps
--
* Extract the the contents of `District_Boundary_2012.zip` (or the name of the zipped file with the shape files) into a directory you wish to work from.
* `cd /path/to/where/files/were-extracted`
* `ogr2ogr -f GeoJSON -t_srs crs:84 districts.json District_Boundary_2012.shp`

#### 3. Extracting district names from the generated geoJSON
The district names are needed when creating distribution plans as locations for consignees and also used to draw and find layers on the map.

######Steps of extracting the names.
* We created a simple [nodejs script] (https://github.com/twkampala/geojson-feature-name-extractor.git) to pick the district names from the geoJSON.
* So clone it `https://github.com/twkampala/geojson-feature-name-extractor.git`
* `cd geojson-feature-name-extractor`
* Configure the script to enable it to find your geojson and tell it where to write the output:
	* Edit `geojson-feature-name-extractor/config.json`
	* `inputFilePath: '/path/to/your-geojson.json'`
	* `outputFilePath: '/desired-path-for-the/district-names.json'`
	* Now run `./extractor.js`
	* At this point we should have the `districts.json` and `district-name.json`

#### 4. Using your generated files to draw eums map.
* Copy both the `districts.json` and `district_name.json` to `eums/eums/client/app/data/`


#### 5. Now configure a few constants for the map rendering
* District name locator
* Map center (lat, long)
* Zoom Level
* Max zoom and min zoom.

###### Steps
* Edit the config files in `eums/eums/client/config/`
* Modify `"MAP_CENTER": [-1.964, 29.859]` and  `"MAP_ZOOM_LEVEL": 9` with the corresponding country center lat, long and the appropriate zoom level. e.g. `"MAP_CENTER": [-32.4, 2.859]`
* Change the `DISTRICT_NAME_LOCATOR` constant to match with the key that returns the district name in your geojson e.g if you have


	```
	{
  "type": "FeatureCollection",
    "crs": {
        "type": "name",
        "properties": {
            "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
        }
    },
    "features": [
        {
            "type": "Feature",
            "properties": {
                "D_06_ID": 1.0,
                "DNAME_2006": "KALANGALA",
                "DNAME_2010": "KALANGALA",
                "AREA": 7745049286.718000411987305,
                "PERIMETER": 360086.68,
                "HECTARES": 774504.929,
                "SUBREGION": "CENTRAL 1",
                "UNICEF": "Kampala Office",
                "Reg_2011": "BUGANDA"
            }
        }
        ]
     }
```

The path to find the district name would be `feature.properties.DNAME_2010 `. In this case you will configure `DISTRICT_NAME_LOCATOR` with the value `DNAME_2010 `. (`DISTRICT_NAME_LOCATOR : DNAME_2010`)

The constants for the case of Uganda look like this.

```
	"MAP_OPTIONS": {
        "CENTER": [1.406, 32.000],
        "ZOOM_LEVEL": 7
    },
    "DISTRICT_NAME_LOCATOR": "DNAME_2010"
```

* If you are running on localhost run `grunt build`
* And start the server `./manage.py runserver` [more about how to start the django app](https://github.com/unicefuganda/eums)
* visit `http://localhost:8000/#/` the map should be showing.
