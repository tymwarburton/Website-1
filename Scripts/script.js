function popPicture(){
    picture = document.querySelector("#Image")
    

    picture.classList.add("pop");
    setTimeout(function(){
        picture.classList.remove("pop");
    }, 300);

}

document.querySelector("#Image").addEventListener("click",popPicture)
