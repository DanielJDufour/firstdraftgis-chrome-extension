JSON.stringify({
    "name": document.title.split(" - ")[0],
    "point": document.getElementsByClassName("geo")[0].textContent.split("; ").map(function(value){
        return Number(value);
    })
})
