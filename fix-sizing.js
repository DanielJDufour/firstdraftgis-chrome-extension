setTimeout(function(){
    if (screenX < 0) {
        let html = document.documentElement;
        html.style.width = (html.clientWidth + screenX) + "px";
    }
}, 1000);
