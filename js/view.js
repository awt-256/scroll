let [V, seed] = decodeURIComponent(location.hash.replace(/\-/g, ' ').slice(1)).split('#');

const piece = document.querySelector("#piece");
const canvas = document.querySelector("#piece canvas");
const seedElem = document.querySelector("#piece .seed");

if (!seed) seed = genRandomSeed();
if (!V) V = 0;

scrollPainters[0](seed, canvas).then(config => {
    config.ticksPerFrame /= 1.3
    // config.brushConfig.
})
piece.style.opacity = "100%";
seedElem.innerText = '"' + convertSeedToWord(seed) + '"';
document.title = "scroll | " + convertSeedToWord(seed)