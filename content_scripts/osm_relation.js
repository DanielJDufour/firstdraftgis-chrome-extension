request = new XMLHttpRequest();
var id_of_relation = document.location.pathname.split("/")[2];
request.open("GET", "https://www.openstreetmap.org/api/0.6/relation/" + id_of_relation +  "/full", false);
request.send();

coordinates = Array.prototype.slice.call(new DOMParser().parseFromString(request.responseText, "application/xml").querySelectorAll("node")).map(function(node){
    return [Number(node.getAttribute("lat")), Number(node.getAttribute("lon"))];
});

//http://stackoverflow.com/questions/22796520/finding-the-center-of-leaflet-polygon
var getCentroid = function (arr) {
    var twoTimesSignedArea = 0;
    var cxTimes6SignedArea = 0;
    var cyTimes6SignedArea = 0;
    var length = arr.length;
    var x = function (i) { return arr[i % length][0]; };
    var y = function (i) { return arr[i % length][1]; };
    for ( var i = 0; i < length; i++) {
        var twoSA = x(i)*y(i+1) - x(i+1)*y(i);
        twoTimesSignedArea += twoSA;
        cxTimes6SignedArea += (x(i) + x(i+1)) * twoSA;
        cyTimes6SignedArea += (y(i) + y(i+1)) * twoSA;
    }
    var sixSignedArea = 3 * twoTimesSignedArea;
    return [ cxTimes6SignedArea / sixSignedArea, cyTimes6SignedArea / sixSignedArea];
}

JSON.stringify({
    "name": document.querySelector("#sidebar_content h2 bdi").textContent,
    "point": getCentroid(coordinates),
    "polygon": coordinates
})
