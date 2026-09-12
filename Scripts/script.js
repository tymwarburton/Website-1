
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
    const currentTime = new Date().toLocaleTimeString();
    document.getElementById("about-button").textContent = "Current Time is: " + currentTime;
}


document.getElementById("about-button").addEventListener("click", aboutButtonClicked);