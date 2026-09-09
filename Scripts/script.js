
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
