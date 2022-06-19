
const c=c => c.onclick = () => location.href = c.getAttribute('href');
document.querySelectorAll("span[href]").forEach(c);
document.querySelectorAll("h3[href]").forEach(c);