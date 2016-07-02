app.controller('TableController',
 ['$scope', '$http', '$window', '$compile', '$element',
  function($scope, $http, $window, $compile, $element) {

      console.log("starting TableController");
      $scope.places = [];

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
            enableSorting: true,
            filterOptions: {
                filterText: ""
            },
            multiSelect: true,
            onRegisterApi: function(api) {
                console.log("api:", api);
                $scope.gridApi = api;
            },
            /*pagingOptions: {
                pageSizes: [10],
                pageSize: [10],
                currentPage: 1
            },*/
            paginationPageSizes: [10],
            paginationPageSize: 10,
            showFilter: true,
            showSelectionBox: true
        };

        $scope.$on('all_places_loaded', function(event, places){
            $scope.places = places;
            $scope.gridApi.core.refresh();
        });

        $scope.download_csv = function() {
            console.log("starting $scope.download");
            csvContent = 'place, latitude, longitude';
            $scope.places.forEach(function(place, index){
                csvContent += '\n"' + place.name + '", ' + place.coordinates[0] + ', ' + place.coordinates[1];
            })
            var options = {
                url: URL.createObjectURL(new Blob( [csvContent], {type: 'text/csv'} )),
                filename: "fdgis_places.csv",
                saveAs: true,
            };
            chrome.downloads.download(options);
        };

        $scope.download_geojson = function() {
            console.log("starting download_geojson");
            var geojson = JSON.stringify({
                type: "FeatureCollection",
                features: $scope.places.map(function(place){
                    return {
                        type: "Feature",
                        geometry: {"type": "Point", "coordinates": place.coordinates},
                        properties: {"name": place.name}
                    }
                })
            });
            var options = {
                url: URL.createObjectURL(new Blob([geojson], {type: "application/vnd.geo+json"})),
                filename: "fdgis_places.geojson",
                saveAs: true
            };
            chrome.downloads.download(options);
        };

        console.log("finishing TableController");

}]);
