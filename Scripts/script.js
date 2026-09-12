const currentTime = new Date().toLocaleString();
function popPicture(imageElement) {
    imageElement.classList.add("pop");
    setTimeout(function () {
        imageElement.classList.remove("pop");
    }, 300);
}

document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("click", function () {
        popPicture(image);
    });
});

function aboutButtonClicked() {
    document.getElementById("about-button").textContent = currentTime;
}


document.getElementById("about-button").addEventListener("click", aboutButtonClicked);