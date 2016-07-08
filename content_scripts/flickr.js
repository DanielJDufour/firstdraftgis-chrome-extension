JSON.stringify({
    "name": document.title.split(" | ")[0],
    "point": /-?\d+.\d{4,}%2C-?\d+.\d{4,}/.exec(document.querySelectorAll(".static-maps .zoom")[0].style.backgroundImage)[0].split("%2C").map(function(value){
        return Number(value);
    })
})
