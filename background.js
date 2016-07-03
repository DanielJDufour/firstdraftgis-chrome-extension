console.log("starting background.js");

NAME_OF_STORE = "places";

var places = [];

function initialize_database() {
    console.log("starting initialize_database");
    var request = indexedDB.open("fdgis");
    request.onupgradeneeded = function() {
        try {
            console.log("fdgis db doesn't exist to create it");
            var db = request.result;
            console.log("db:", db);
            var store = db.createObjectStore(NAME_OF_STORE, {autoIncrement: true});
            console.log("created store", store);
            store.createIndex("by_name", "name", {unique: true});
            store.createIndex("by_source", "source", {unique: false});
        } catch (err) { console.error(err); }
    };
}
initialize_database();
console.log("initialize_database:", initialize_database);

function add_place_to_database(place) {
    console.log("starting add_place_to_database with", place);
    var request = indexedDB.open("fdgis");
    request.onerror = function(event) {
        console.error(event);
    };
    request.onsuccess = function(event) {
        try {
            console.log("request.onsucess event", event);
            db = request.result;
            var transaction = db.transaction(NAME_OF_STORE, "readwrite");
            var store = transaction.objectStore(NAME_OF_STORE);
            store.put(place);

            transaction.onabort = function(event) { console.error(transaction.error); }

            transaction.oncomplete = function() {
                console.log("put", place, "in", store);
            }

        } catch (error) { console.error(error); }
    };
}
console.log("add_place_to_database:", add_place_to_database);



function add_place(place) {
    try {
        console.log("starting add_place with", place);
        add_place_to_database(place);
        chrome.runtime.sendMessage(place);
        console.log("send")
    } catch (error) { console.error(error); }
}
console.log("add_place:", add_place);


chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    var status = changeInfo.status;
    var url = tab.url;
    //console.log("url:", url);
    //console.log("status:", status);
    if (status == 'loading') {
        var url = tab.url;

        /*
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://firstdraftgis.com/extension", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                console.log()
            }
        }
        xhr.send();
        */
    } else if (status == "complete") {
        if (/^https?:\/\/[a-z]{2,3}.wikipedia.org\/wiki\/[A-Za-z\d_,í%]+$/.test(url)) {
            console.log("on wikpedia");
            //regular wikipedia page
            setTimeout(function () {
                chrome.tabs.executeScript(tabId, { file: "/content_scripts/wikipedia.js"}, function (array_of_results) {
                    var place = JSON.parse(array_of_results[0]);
                    place.source = "Wikipedia";
                    if (place) {
                        console.log("Content script returned", place);
                        add_place(place);
                    } else {
                        console.log("Uh Oh! Failed to get a place from ", url);
                    }
                });
            }, 2000);
        } else if (/^https?:\/\/www.flickr.com\/photos\/[a-z\d_]+\/\d+/.test(url)) {
            console.log("flickr");
            setTimeout (function () {
                console.log("executing script for flickr");
                chrome.tabs.executeScript(tabId, { file: "/content_scripts/flickr.js"}, function(array_of_results) {
                    console.log("array_of_results:", array_of_results);
                    var place = JSON.parse(array_of_results[0]);
                    place.source = "Flickr";
                    if (place) {
                        add_place(place)
                    } else {
                        console.log("Uh Oh! Failed to get a place from ", url);
                    }
                });
            }, 3000);
        }
    }
})
