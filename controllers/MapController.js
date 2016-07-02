app.controller('MapController',
 ['$scope', '$http', '$window', '$compile', '$element',
  function($scope, $http, $window, $compile, $element) {

    console.log("starting MapController.js");
    var map = L.map("map");
    console.log("map:", map);
    map.setView([0,0],0);
    var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors.',
        maxZoom: 18
    }).addTo(map);


    $scope.$on('all_places_loaded', function(event, places){
        console.log("all_places_loaded:", event, places);
        places.forEach(function(place){
            console.log("place",place);
            L.marker(place.coordinates, {
                clickable: true
            })
            //.bindLabel("sup")
            .bindPopup(place.name)
            .addTo(map);
        });
    });

    console.log("finishing MapController.js");

}]);
