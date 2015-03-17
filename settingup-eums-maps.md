Setting up a EUMS map for a new country.
---

This guide is specifically for setting up a map for new country within the EUMS system. For details on how to setup the EUMS project in general, please refer to the main project [README] (https://github.com/unicefuganda/eums).

#### 1. Prerequisites

* GDAL (GeoSpatial Data Abstraction Library)
	* For Mac OSX - Install this by running `brew install gdal`
	* Instructions on building and installing this for other operating systems can be found [here] (http://www.gdal.org/wince.html) for Windows  and [here] (http://www.sarasafavi.com/installing-gdalogr-on-ubuntu.html) for Ubuntu Linux.
* Acquire the country's Shapefile. 
	* OpenStreetMaps is based on the WGS 84 coordinate system, so you'll need a Shapefile that conforms to this coordinate system. 
	* Therefore, make sure your Shapefile includes a projection file (extension .prj) for this coordinate system (along with the required files with extensions .shp, .shx, and .dbf).


####2. Convert Shapefile to GeoJSON file

Installing `gdal` will give you a commandline tool known as `ogr2ogr` which enables you to convert a Shapefile (`.shp`) to a GeoJSON file (`.json` or `.geojson`). In addition, the website [mapshaper.org] (http://mapshaper.org) will allow you to simplify the GeoJSON file so that it can be consumed directly on the front end.

#####Steps:

* `cd /path/to/where/shapefile/exists`
* `ogr2ogr -f GeoJSON -t_srs crs:84 districts.json <name-of-shapefile>.shp`
* Upload this newly created GeoJSON file to [mapshaper.org] (http://mapshaper.org), and simplify it to a size that does not exceed 500K.
* Download this simplified file from mapshaper.org.

#### 3. Extracting district names from the generated GeoJSON

The district names are needed when creating distribution plans as locations for consignees and also used to draw and find layers on the map. We've created a simple [nodejs script] (https://github.com/twkampala/geojson-feature-name-extractor.git) to create the district names from the GeoJSON file.

#####Steps:

* Clone the script at `https://github.com/twkampala/geojson-feature-name-extractor.git`
* `cd geojson-feature-name-extractor`
* Configure the script to enable it to find your GeoJSON file and tell it where to write the output:
	* Edit `geojson-feature-name-extractor/config.json`
	* `inputFilePath: '/path/to/your-geojson.json'`
	* `outputFilePath: '/desired-path-for-the/district-name.json'`
	* Now run `./extractor.js`
	* At this point we should have the `districts.json` and `district-name.json`

#### 4. Copying generated files to appropriate project directories

* Copy both the `districts.json` and `district_name.json` to `eums/eums/client/app/data/`

#### 5. Now configure a few constants for the map rendering

Configuration is necessary for the following:

* District name locator
* Map center (lat, long)
* Zoom Level

#####Steps:

* The map configuration exists within each of the environment files located in `eums/eums/client/config/`. You'll want to change each of these with the appropriate map configurations.
	* Set `MAP_CENTER` to the coordinates representing the center of the map:
		* Here is a website that lets you easily figure out the center coordinates of a country: [teczno.com] (http://teczno.com/squares/#6/1.41/32.00)
		* Another website is [freeside's geolocator] (http://tools.freeside.sk/geolocator/geolocator.html) that lets you figure out the center coordinates of a country.
	* Set `MAP_ZOOM_LEVEL` with the appropriate zoom level.
	* Set `DISTRICT_NAME_LOCATOR` with the key in the properties section of your GeoJSON file that represents the district name.

* The map configuration for Uganda looks like this:

	```
	"MAP_OPTIONS": {
		"CENTER": [1.406, 32.000],
		"ZOOM_LEVEL": 7
	},
	"DISTRICT_NAME_LOCATOR": "DNAME_2010"
	```

#### 6. Bounce the server

Once the configuration is done, make sure the application is bounced, in order to pick up these new settings.
