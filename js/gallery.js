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
        desc.innerText = 'Click to view "' + seed + '"';
        const canvas = photo.appendChild(document.createElement('canvas'));
        canvas.width = canvas.height = 400;
        canvas.setAttribute('seed', seed);
        scrollPainters[V](seed, canvas).then(globalConfig => {
            const {r,g,b} = globalConfig.colorConfig.background;
            photo.classList.add(r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "bright" : "dark");
        });
    }));
};
gallery.addEventListener('click', (click) => {
    if (click.target instanceof HTMLCanvasElement) {
        window.open(location.origin + "/view#" + V + "#" + click.target.getAttribute('seed').replace(/ /g, '-'));
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