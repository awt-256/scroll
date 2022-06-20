const gallery = document.getElementById('gallery');
// Version
const V = 0;
const pushFrames = () => {
    return Promise.all(Array(12).fill().map(_ => {
        const seed = genRandomSeed();
        const photo = gallery.appendChild(document.createElement('div'));
        photo.className = "photo";
        const desc = photo.appendChild(document.createElement('span'));
        desc.className = 'seed';
        desc.innerText = 'Click to view "' + convertSeedToWord(seed) + '"';
        const canvas = photo.appendChild(document.createElement('canvas'));
        canvas.width = canvas.height = 400;
        photo.setAttribute('seed', seed);
        scrollPainters[V](seed, canvas).then(globalConfig => {
            const {r,g,b} = globalConfig.colorConfig.background;
            photo.classList.add(r * Color.DENSITY.R + g * Color.DENSITY.G + b * Color.DENSITY.B > 150 ? "bright" : "dark");
        });
    }));
};
gallery.addEventListener('click', (click) => {
    const photo = click.path.find(e=>e.classList.contains('photo'));
    if (photo) {
        window.open(location.origin + "/view#" + V + "#" + photo.getAttribute('seed').replace(/ /g, '-'));
    }
});
for (let i = 0; i < 1; ++i) pushFrames();
const wheel = () => {
    if (document.body.scrollHeight - (document.body.clientHeight + document.body.scrollTop) < 500) {
        pushFrames();
    }
}
document.addEventListener('wheel', wheel)
document.addEventListener('mousewheel', wheel)
document.addEventListener('touchmove', wheel)
document.addEventListener('scroll', wheel)
document.addEventListener('swipe', wheel)
// prompt('a', Object.keys(HTMLElement.prototype))