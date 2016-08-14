request = new XMLHttpRequest();
var id_of_relation = document.location.pathname.split("/")[2];
request.open("GET", "https://www.openstreetmap.org/api/0.6/relation/" + id_of_relation + "/full", false);
request.send();
var geometries = get_geometries_from_geojson(osmtogeojson(request.responseXML));

JSON.stringify({
    "name": document.querySelector("#sidebar_content h2 bdi").textContent,
    "point": geometries.point,
    "multipolygon": geometries.multipolygon
})
