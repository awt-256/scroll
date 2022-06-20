const serializeSeed = (input) => {
    let hash = 3;
    const pow = (k, c) => {
        let m = k;
        for (let i = 0; i < c; ++i) m = (m * k) >>> 0;
        return m;
    }
    const bytes = new TextEncoder().encode(input);
    for (let c of bytes) {
        for (let b of bytes) {
            hash = (hash + pow(hash, c) ^ pow(b, c) ^ 0x9e83b6) >>> 0;
        }
    }
    return hash;
}
const VOWELS = "aieou".split("");
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split('')
const CONSONANTS = ALPHABET.filter(c => !VOWELS.includes(c));
const WHITESPACE = [' ', ''];
const CHARS = ALPHABET.concat(WHITESPACE);

const genRandomSeed = () => {
    const COUNT = 10;
    let out = ""
    for (let i = 1; i <= COUNT; ++i) {
        if (i === 1 || i === COUNT) out += ALPHABET[~~(Math.random()*ALPHABET.length)];
        else out += CHARS[~~(Math.random()*CHARS.length)];
    }

    return out;
}

const convertSeedToWord = (seed) => {
    const arr = seed.split('');
    let cc = 0;
    for (let i = 0; i < arr.length - 1; ++i) {
        if (!VOWELS.includes(arr[i]) && !VOWELS.includes(arr[i + 1])) {
            if (WHITESPACE.includes(arr[i+1])) arr[i] = VOWELS[CHARS.indexOf(arr[i]) % VOWELS.length]
            else arr[i+1] = VOWELS[CHARS.indexOf(arr[i+1]) % VOWELS.length]
        } else if (VOWELS.includes(arr[i]) && VOWELS.includes(arr[i + 1]) && VOWELS.includes(arr[i + 3])) {
            arr[i] = CHARS[(i * VOWELS.indexOf(arr[i])) % CHARS.length]
        }
        if (!WHITESPACE.includes(arr[i])) cc += 1;
        else cc = 0;
        if (cc >= 6) {
            arr.splice(i+1,0,' ');
            cc = 0;
        }
    }
    return arr.join('');
}


const newRng = (seed, mul = 0x7AA63A9, inc = 0xA73BCD, mod = 0x6AE7FF89) => {
    if (typeof seed !== "number") seed = serializeSeed(seed);
    return () => (seed = ((seed * mul + inc) % mod)) / mod
}

class Color {
    static DENSITY = {
        R: 0.299,
        G: 0.587,
        B: 0.114
    }
    constructor(colorConfig, r, g, b) {
        this.colorConfig = colorConfig;
        if (r == undefined) r = ~~(colorConfig.getRandom() * 0xFFFFFF)
        if (g == undefined && b == undefined) {
            g = (r >> 8) & 0xFF
            b = r & 0xFF
            r = (r >> 16) & 0xFF
        }
        
        this.r = r;
        this.g = g;
        this.b = b;
    }

    val() {
        return (this.r << 16) | (this.g << 8) | this.b;
    }
    hex() {
        return "#" + this.val().toString(16).padStart(6, "0");
    }

    lerp(dest, k = this.colorConfig.blendRate) {
        this.r = Math.max(Math.min(lerp(this.r, dest.r, k), 255), 0);
        this.g = Math.max(Math.min(lerp(this.g, dest.g, k), 255), 0);
        this.b = Math.max(Math.min(lerp(this.b, dest.b, k), 255), 0);

        return this;
    }
    contrast(dest, k = this.colorConfig.contrastRate) {
        return this.lerp(dest, k);
    }
}

class Stroke {
    constructor(globalConfig, x = 0, y = 0, color = new Color(globalConfig.colorConfig, 0xFFFFFF)) {
        this.t_x = this.x = x;
        this.t_y = this.y = y;
        this.t_zx = this.zx = 200;
        this.t_zy = this.zy = 200;
        this.t_size = this.size = 5;
        this.t_color = this.color = color;
        this.globalConfig = globalConfig;
        this.brushConfig = globalConfig.brushConfig;
        this.colorConfig = globalConfig.colorConfig;
        this.strokeCount = -1;
        this.done = false;
    }

    setTargets() {
        this.strokeCount += 1;
        if (this.strokeCount === this.brushConfig.strokeCount) {
            this.done = true;
            return;
        } else if (this.strokeCount > this.brushConfig.strokeCount) {
            console.warn('Unexpected, past strokeCount', this.globalConfig);
            return;
        }
        const { getRandom } = this.globalConfig;

        this.t_zx = getRandom() * 200 + 20;
        this.t_zy = getRandom() * 200 + 20;
        this.t_x = getRandom() * this.globalConfig.size;
        this.t_y = getRandom() * this.globalConfig.size;
        const experience = new Color(this.colorConfig);
        const mindset = getRandom() < this.brushConfig.contrastRatio ? "contrast" : "lerp";
        this.t_color = experience[mindset](this.colorConfig.theme);
    }

    tick() {
        const dist = Math.hypot(this.t_x - this.x, this.t_y - this.y);
        if (dist < this.brushConfig.completitionRange) {
            this.setTargets();
        } else {
            const t_size = this.t_size = (dist ** (this.brushConfig.sizeFactor))
            this.zx = lerp(this.zx, this.t_zx, 5);
            this.zy = lerp(this.zy, this.t_zy, 5);
            this.x = lerp(this.x, this.t_x, this.zx);
            this.y = lerp(this.y, this.t_y, this.zy);
            this.size = lerp(this.size, t_size, 100);
            this.color.lerp(this.t_color, 10);
        }
    }

    render(ctx) {
        ctx.strokeStyle = '';
        ctx.lineWidth = 0;
        ctx.fillStyle = this.color.hex();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

const lerp = (cur, dest, k) => {
    return cur + ((dest - cur) / k);
}

const nextFrame = () => new Promise(r => requestAnimationFrame(r));

const paintScroll = async (globalConfig) => {
    const { colorConfig, brushConfig, canvas, getRandom, size } = globalConfig;
    const ctx = canvas.getContext('2d');

    if (canvas.height !== size) throw new RangeError("Rectangular canvas was provided, but expected a perfect square");

    const brushes = Array(brushConfig.brushCount).fill().map(_ => new Stroke(globalConfig, getRandom() * size, getRandom() * size));
    let completionCount = 0;

    ctx.save();
    ctx.fillStyle = colorConfig.background.hex();
    ctx.fillRect(0, 0, size, size);
    ctx.transform(0.8, 0, 0, 0.8, size * 0.1, size * 0.1)

    while (completionCount !== brushConfig.brushCount) {
        for (let f = 0; f < globalConfig.ticksPerFrame; ++f) {
            for (let i = brushes.length; --i >= 0; ) {
                const brush = brushes[i];
                brush.tick();
                if (brush.done) {
                    brushes.splice(i, 1);
                    completionCount += 1;
                } else {
                    brush.render(ctx);
                }
            }
        }
        await nextFrame();
    }
    ctx.restore();

    return true;
}

const scrollPainters = [async (seed, canvas) => {
    const getRandom = newRng(seed);
    const size = canvas.width;
    const globalConfig = { canvas, size, getRandom, ticksPerFrame: 7};

    const colorConfig = globalConfig.colorConfig = { getRandom, blendRate: 1 / 1.3, contrastRate: -1 / 3 };

    colorConfig.theme = new Color(colorConfig);
    colorConfig.background = new Color(colorConfig)

    const brushCountNum = getRandom();
    const brushConfig = globalConfig.brushConfig = { contrastRatio: 0.1, brushCount: brushCountNum < 0.05 ? 3 : brushCountNum < 0.1 ? 2 : 1, strokeCount: ~~(getRandom() * 7) + 1, sizeFactor: 1 / 1.3, completitionRange: size / 40 };

    paintScroll(globalConfig);

    return globalConfig;
}];