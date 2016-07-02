console.log("starting background.js");

/*
chrome.browserAction.onClicked.addListener(function (tab) {
    // ...if it matches, send a message specifying a callback too
    chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, doStuffWithDom);
});
*/

/*
setTimeout(function(){

    chrome.tabs.executeScript({
        code: "window.document.documentElement.textContent"
    }, function(x){t=x;});

}, 2000);
*/

function initialize_database() {
    var request = indexedDB.open("fdgis");
    request.onupgradeneeded = function() {
        // The database did not previously exist, so create object stores and indexes
        var db = request.result;
        var store = db.createObjectStore("places", {autoIncrement: true});
        var titleIndex = store.createIndex("by_name", "name", {unique: true});
        var titleIndex = store.createIndex("by_source", "source", {unique: true});
    };
}
console.log("initialize_database:", initialize_database);

function add_place_to_database(place) {
    console.log("starting add_place_to_database with", place);
    var request = indexedDB.open("fdgis");
    request.onsuccess = function() {
        db = request.result;
        var transaction = db.transaction("places", "readwrite");
        var store = transaction.objectStore("places");
        store.put(place);
    };
}
console.log("add_place_to_database:", add_place_to_database);


function add_place(place) {
    console.log("starting add_place with", place);
    add_place_to_database(place);
    chrome.runtime.sendMessage(place);
}
console.log("add_place:", add_place);


chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    var status = changeInfo.status;
    var url = tab.url;
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
        console.log('complete', url);
        if (/^https?:\/\/[a-z]{2,3}.wikipedia.org\/wiki\/[A-Za-z\d_,í%]+$/.test(url)) {
            console.log("on wikpedia");
            //regular wikipedia page

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
        } else if (/^https?:\/\/www.flickr.com\/photos\/[a-z\d]+\/\d+/.test(url)) {
            console.log("flickr");
            setTimeout (function () {
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
