app.controller('MainController',
 ['$scope', '$http', '$window', '$compile', '$element',
  function($scope, $http, $window, $compile, $element) {

      $scope.getAllPlaces = function(callback) {
          console.log("starting getAllItems");
          var request = indexedDB.open("fdgis");
          request.onsuccess = function(event) {
              var items = [];
              var db = request.result;
              var transaction = db.transaction("places", "readwrite");
              transaction.oncomplete = function (event) {
                  callback(items);
              };
              var store = transaction.objectStore("places");
              var cursorRequest = store.openCursor();
              cursorRequest.onsuccess = function(evt) {
                  var cursor = evt.target.result;
                  if (cursor) {
                      value = cursor.value;
                      if (value) {
                          items.push(value);
                      }
                      cursor.continue();
                  }
              };
          };
      }
      $scope.getAllPlaces(function(places){
          $scope.places = places;
          $scope.$broadcast('all_places_loaded', places);
      });

}]);
