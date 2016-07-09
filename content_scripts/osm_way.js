var name = document.querySelector("#sidebar_content h2 bdi").textContent;
var multipolygon = null;
var point = null;

request = new XMLHttpRequest();
var id_of_way = document.location.pathname.split("/")[2];
request.open("GET", "https://www.openstreetmap.org/api/0.6/way/" + id_of_way + "/full", false);
request.send();
geojson = osmtogeojson(request.responseXML);
if (geojson.type === "FeatureCollection") {
    // find the primary feature for the way
    // ignore tangential indirectly related features
    var feature = _.find(geojson.features, function(feature){ return feature.id === "way/" + id_of_way; });
    if (feature.geometry.type === "Polygon") {
        // eventhough it only has one polygon, we store all shapes with filling as multipolygons
        // because it makes the database management easier
        // wrapping the coordinates in an array makes it the first and only polygon in an array of polygons
        multipolygon = [feature.geometry.coordinates];
        point = turf.centroid(feature).geometry.coordinates;
    } else if (feature.geometry.type === "MultiPolygon") {
        multipolygon = feature.geometry.coordinates;
        // I think turf might get the centroid of all the polygons
        // will want to rewrite so only get centroid of largest polygon
        point = turf.centroid(feature).geometry.coordinates;
    }
}



JSON.stringify({
    "name": name,
    "point": point,
    "multipolygon": multipolygon
})
