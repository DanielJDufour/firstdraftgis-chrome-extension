JSON.stringify({
    "name": document.title.split(" - ")[0],
    "coordinates": document.getElementsByClassName("geo")[0].textContent.split("; ").map(function(value){
        return Number(value);
    })
})
