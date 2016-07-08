JSON.stringify({
    "name": document.querySelector("#sidebar_content h2 bdi").textContent,
    "point": document.querySelector(".details.geo a").textContent.split(", ").map(function(value){
        return Number(value);
    })
})
