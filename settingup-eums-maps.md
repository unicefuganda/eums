Setting up eums map for a new country depolyment: Case study Rwanda.
---
## NOTE
This guide is specifically for customising the map/dashborad.  For the details on how to setup the project please refer to the [Project README] (https://github.com/unicefuganda/eums).

#### 1. The things you will need
* GDAL (GeoSpartial Data Abstraction Library) 
	* For Mac OSX) `brew install gdal`
	* Other instructions on building and installation: [windows] (http://www.gdal.org/wince.html) and [Linux] (http://www.sarasafavi.com/installing-gdalogr-on-ubuntu.html). Note 
	* Acquire the countries shape files in this case Rwanda's shape files can be found on the [National institute of statistics Rwanda] (http://www.statistics.gov.rw/geodata) website.

	
####2. Converting the shape file to geoJSON
Installing `gdal` will give you a commandline tool known as `ogr2ogr` which enables you to chonver shape files to geoJSON.


####Steps
--
* Extract the the contents of `District_Boundary_2012.zip` into a directory you wish to work from.
* `cd /path/to/where/files/were-extracted` 
* `ogr2ogr -f GeoJSON -t_srs crs:84 districts.json District_Boundary_2012.shp`

#### 3. Extracting district names from the geoJSON
The district names are needed for when creating distribution plans as locations for consignees and also used to draw and find layers on the map.

######Steps of extracting the names.
* I created a simple [nodejs script] (https://github.com/twkampala/geojson-feature-name-extractor.git) to pick the names from your geoJSON.
* So clone it `https://github.com/twkampala/geojson-feature-name-extractor.git`
* `cd geojson-feature-name-extractor`
* Configure the script:
	* Edit `geojson-feature-name-extractor/config.json`
	* `inputFilePath: '/path/to/your-geojson.json'`
	* `outputFilePath: '/desired-path-for-the/district-names.json'`
	* Now run `./extractor.js`
	* at this point we should have the `districts.json` and `district-name.json`

#### 4. Using our files in eums app.
* copy both the `districts.json` and `district_name.json` to `eums/eums/client/app/data/`


#### 5. Now configure a few constants for the map rendering
* District name locator
* Map center (lat, long)
* Zoom Level
* Max zoom and min zoom.

###### Steps
* Edit the config files in `eums/eums/client/config/`
* modify `"MAP_CENTER": [-1.964, 29.859]` and  `"MAP_ZOOM_LEVEL": 9` with the corresponding country center lat, long and the appropriate zoom level.
* If you are running on localhost run `grunt build`
* And start the server, visit `http://localhost:8000/#/` the map should be showing.