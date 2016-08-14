function get_geometries_from_geojson(geojson) {
    var point;
    var multipolygon;
    if (geojson.type === "FeatureCollection") {
        // find the primary feature for the relation
        // ignore tangential indirectly related features
        var feature = _.find(geojson.features, function(feature){ return feature.id === "relation/" + id_of_relation; });
        if (feature.geometry.type === "Polygon") {
            // eventhough it only has one polygon, we store all shapes with filling as multipolygons
            // because it makes the database management easier
            // wrapping the coordinates in an array makes it the first and only polygon in an array of polygons
            multipolygon = [turf.flip(feature).geometry.coordinates];

            //reversing point coordinates to latlng from geojson format
            point = turf.centroid(feature).geometry.coordinates.reverse();
            console.log("reversed point from turf is", point);
        } else if (feature.geometry.type === "MultiPolygon") {
            multipolygon = turf.flip(feature).geometry.coordinates;

            //turf gets the centroid of all the polygons
            //for visualization purposes, we only want centroid of largest polygon
            var biggest_polygon = _.max(feature.geometry.coordinates.map(function(polygon){
                return turf.polygon(polygon);
            }).map(function(feature){
                feature.properties.area = turf.area(feature);
                return feature;
            }), function(feature) { return feature.properties.area; });
            point = turf.centroid(biggest_polygon).geometry.coordinates.reverse();
        }
    }

    console.log("finishing get_geometries_from_geojson with", {point:point, multipolygon:multipolygon});
    return {point:point, multipolygon:multipolygon};
}
