const V = 0;
let seed = genRandomSeed();

const piece = document.querySelector("#piece");
const canvas = document.querySelector("#piece canvas");
const seedElem = document.querySelector("#piece .seed");


scrollPainters[0](seed, canvas).then(config => {
    config.brushConfig.strokeCount = Math.max(config.brushConfig.strokeCount, 3);
    config.ticksPerFrame *= 1.3
})
piece.style.opacity = "70%";
// seedElem.style.opacity = "80%";
seedElem.innerText = '"' + convertSeedToWord(seed) + '"';
document.title = "scroll";
piece.addEventListener('click', () => {
    window.open(location.origin + "/view#" + V + "#" + seed.replace(/ /g, '-'));
});