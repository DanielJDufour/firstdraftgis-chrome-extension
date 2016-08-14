NAME_OF_DATABASE = "fdgis";
NAME_OF_STORE = "places";
deleteModal = $(document.getElementById("deleteModal"));
downloadModal = $(document.getElementById("downloadModal"));

app.controller('MainController',
['$scope', '$http', '$window', '$compile', '$element',
function($scope, $http, $window, $compile, $element) {

    console.log("initialize places to empty array before query db for places");
    $scope.places = [];

    console.log("initializing the map");
    map = L.map("map");
    map.setView([0,0],0);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors.',
        maxZoom: 18
    }).addTo(map);

    var selectedMarkerOptions = {
        clickable: true,
        color: "red",
        fillColor: "red"
    };

    var unselectedMarkerOptions = {
        clickable: true,
        color: "blue",
        fillColor: "blue"
    };

    console.log("loading all places");
    var temp_places = [];
    var request = indexedDB.open(NAME_OF_DATABASE);
    request.onsuccess = function(event) {
        var db = request.result;
        var transaction = db.transaction("places", "readonly");
        transaction.oncomplete = function (event) {
            $scope.places = temp_places;
            $scope.markers = [];
            $scope.places.forEach(function(place){
                try {
                    // supporting old version that had coordinates as point
                    var marker = L.circleMarker((place.point||place.coordinates), unselectedMarkerOptions);
                    marker.key = place.key; //modding layer marker object by adding key property
                    marker.bindPopup(
                        "<div style='text-align:center'><b>"+place.name+"</b></div>" +
                        "<div><b>Latitude:</b> " + (place.point||place.coordinates)[0] + "</div>" +
                        "<div><b>Longitude:</b> " + (place.point||place.coordinates)[1] + "</div>"
                    ).addTo(map);
                    $scope.markers.push(marker);
                } catch (err) {console.error(err);}
            });

            // if the ui-grid has already initialized, we need to refresh it
            // so that the loaded places appear
            if ($scope.gridApi) $scope.gridApi.core.refresh();
        };
        var store = transaction.objectStore("places");
        var cursorRequest = store.openCursor();
        cursorRequest.onsuccess = function(evt) {
            var cursor = evt.target.result;
            if (cursor) {
                var value = cursor.value;
                value.key = cursor.key;
                if (value) {
                    temp_places.push(value);
                }
                cursor.continue();
            }
        };
    };



    $scope.setMarkerStyleForRowItem = function(rowItem){
        var key = rowItem.entity.key;
        var marker = _.find($scope.markers, function(marker){
            return marker.key === key;
        });
        if (rowItem.isSelected) {
            marker.setStyle(selectedMarkerOptions);
            marker.bringToFront();
        } else {
            marker.setStyle(unselectedMarkerOptions);
            marker.bringToBack();
        }
    };

    $scope.gridOptions = {
        columnDefs: [
            {displayName: 'Name', enableFiltering: true, enableSorting: true, field: 'name'},
            {displayName: 'Source', enableFiltering: true, enableSorting: true, field: 'source'},
        ],
        data: "places",
        enableFiltering: true,
        enablePaging: true,
        enableRowHeaderSelection: true,
        enableRowSelection: true,
        enableSelectAll: true,
        enableSorting: true,
        filterOptions: {
            filterText: ""
        },
        multiSelect: true,
        onRegisterApi: function(api) {
            $scope.gridApi = api;
            api.selection.on.rowSelectionChanged($scope, function(rowItem){
                $scope.setMarkerStyleForRowItem(rowItem);
            });
            api.selection.on.rowSelectionChangedBatch($scope, function(rows){
                rows.forEach(function(rowItem){
                    $scope.setMarkerStyleForRowItem(rowItem);
                });
            });
        },
        paginationPageSizes: [10],
        paginationPageSize: 10,
        rowTemplate: '<div ng-right-click="showRowMenu()">' +
                ' <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
              '</div>',
        showFilter: true,
        showSelectionBox: true
    };

    $scope.showRowMenu = function() {
        console.log("showRowMenu:");
    };

    $scope.download_csv = function() {
        console.log("starting download_csv");
        csvContent = 'place, latitude, longitude';
        var selectedRows = $scope.gridApi.selection.getSelectedRows();
        (selectedRows.length == 0 ? $scope.places : selectedRows).forEach(function(place){
            csvContent += '\n"' + place.name + '", ' + (place.point || place.coordinates)[0] + ', ' + (place.point || place.coordinates)[1];
        });
        var options = {
            url: URL.createObjectURL(new Blob( [csvContent], {type: 'text/csv'} )),
            filename: "fdgis_places.csv",
            saveAs: true,
        };
        chrome.downloads.download(options);
    };

    $scope.download_geojson = function() {
        console.log("starting download_geojson");
        var geojson = {type: "FeatureCollection", features: []};
        var selectedRows = $scope.gridApi.selection.getSelectedRows();
        console.log("selectedRows:", selectedRows);
        console.log("scope.places:", $scope.places);
        (selectedRows.length == 0 ? $scope.places: selectedRows).forEach(function(place){
            // want to make this into a geometry collection if have more than just point

            var number_of_geometries =
            _.has(place, 'point') +
            _.has(place, "coordinates") +
            _.has(place, "multipolygon");

            if (number_of_geometries == 1) {
                // if only one geometry, we know this has to be a point
                geojson.features.push(
                    turf.point(
                        //we reverse because db stores as latlng
                        (place.point || place.coordinates).slice().reverse(), {name: place.name}
                    )
                );
            } else {
                var feature = {
                    type:"Feature",
                    geometry: {
                        type: "GeometryCollection",
                        geometries: []
                    },
                    properties: {
                        name: place.name
                    }
                };
                if (place.point) {
                    feature.geometry.geometries.push({
                        type: 'Point',
                        coordinates: place.point.slice().reverse()
                    });
                }
                if (place.multipolygon) {
                    var polygons = place.multipolygon;
                    var number_of_polygons = polygons.length;
                    if (number_of_polygons === 1) {
                        feature.geometry.geometries.push({
                            type: 'Polygon',
                            coordinates: turf.flip(turf.polygon(polygons[0])).geometry
                        });
                    } else if (number_of_polygons > 1) {
                        feature.geometry.geometries.push({
                            type: 'MultiPolygon',
                            coordinates: turf.flip(turf.multiPolygon(polygons)).geometry
                        });
                    }
                }
            }
        });
        var options = {
            url: URL.createObjectURL(new Blob([JSON.stringify(geojson)], {type: "application/vnd.geo+json"})),
            filename: "fdgis_places.geojson",
            saveAs: true
        };
        chrome.downloads.download(options);
    };

    $scope.delete = function() {
        console.log("starting delete");
        var selectedRows = $scope.gridApi.selection.getSelectedRows();
        if (selectedRows.length == 0) {
            deleteModal.modal();
            // if you select yes in the modal, it will call delete_all_places
        } else {
            var keys_of_places_to_delete = selectedRows.map(function(row){ return row.key; });

            // delete from database
            console.log("delete from database");
            var request = indexedDB.open(NAME_OF_DATABASE);
            request.onsuccess = function() {
                var objectStore = request.result.transaction(NAME_OF_STORE, "readwrite").objectStore(NAME_OF_STORE);
                keys_of_places_to_delete.forEach(function(key){
                    objectStore.delete(key);
                });
            };

            // update $scope.places, which ui-grid looks at
            $scope.places = $scope.places.filter(function(place){
                return keys_of_places_to_delete.indexOf(place.key) == -1;
            });
            $scope.gridApi.core.refresh();

            // remove markers that are in list of those to delete
            for (var key in map._layers) {
                var layer = map._layers[key];
                if (layer instanceof L.CircleMarker) {
                    if (keys_of_places_to_delete.indexOf(layer.key) > -1) {
                        map.removeLayer(layer);
                    }
                }
            }
        }
        console.log("finishing delete");
    };

    $scope.delete_all_places = function() {
        console.log("starting delete_all_places");

        // deleting all places from the delete_all_places_from_database
        var request = indexedDB.open(NAME_OF_DATABASE);
        request.onsuccess = function() {
            request.result.transaction(NAME_OF_STORE, "readwrite").objectStore(NAME_OF_STORE).clear();
        };

        // deleting all places from the ui-grid
        $scope.places = [];
        $scope.gridApi.core.refresh();

        // deleting all places from the map
        for (var key in map._layers) {
            var layer = map._layers[key];
            if (layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
            }
        }

        deleteModal.modal("hide");

        console.log("finishing delete_all_places");
    };

    console.log("finishing MainController.js");

}]);
