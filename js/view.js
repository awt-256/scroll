const [V, seed] = decodeURIComponent(location.hash.replace(/\-/g, ' ').slice(1)).split('#');

const piece = document.querySelector("#piece");
const canvas = document.querySelector("#piece canvas");
const seedElem = document.querySelector("#piece .seed");


scrollPainters[0](seed, canvas).then(config => config.ticksPerFrame /= 1.3)
piece.style.opacity = "100%";
seedElem.innerText = '"' + seed + '"';
document.title = "scroll | " + seed