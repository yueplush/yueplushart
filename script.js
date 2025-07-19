document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    createGeometricAnimation();
});

function createGeometricAnimation() {
    const canvas = document.getElementById('geo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Fill initial background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let t = 0;
    function draw() {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = 'lighter';
        const cx = width / 2;
        const cy = height / 2;
        const maxR = Math.min(width, height) * 0.4;
        const layers = 10;

        for (let i = 0; i < layers; i++) {
            const progress = i / layers;
            const radius = maxR * progress * (1 + 0.15 * Math.sin(t * 0.015 + i));
            const sides = 3 + i;
            ctx.beginPath();
            for (let j = 0; j <= sides; j++) {
                const angle = t * 0.008 * (i + 2) + j * Math.PI * 2 / sides;
                const x = cx + radius * Math.cos(angle);
                const y = cy + radius * Math.sin(angle);
                j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            const hue = (t * 0.5 + i * 40) % 360;
            ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        t += 0.4;
        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}

function initNavigation() {
    const navLinks = document.querySelectorAll('nav a[data-section]');
    const heroSection = document.getElementById('hero');
    let activeSection = heroSection;

    // Hide all content sections initially
    document.querySelectorAll('.content-section.hidden').forEach(sec => {
        sec.style.display = 'none';
    });

    heroSection.classList.add('visible');

    function fadeOut(element) {
        return new Promise(resolve => {
            element.classList.remove('visible');
            element.classList.add('hidden');
            element.addEventListener('transitionend', function handler(e) {
                if (e.target === element) {
                    element.style.display = 'none';
                    element.removeEventListener('transitionend', handler);
                    resolve();
                }
            });
        });
    }

    function fadeIn(element) {
        element.style.display = 'block';
        // Force reflow to apply the new display before removing the class
        void element.offsetWidth;
        return new Promise(resolve => {
            element.classList.remove('hidden');
            element.classList.add('visible');
            element.addEventListener('transitionend', function handler(e) {
                if (e.target === element) {
                    element.removeEventListener('transitionend', handler);
                    resolve();
                }
            });
        });
    }

    async function showSection(section) {
        if (activeSection === section) return;
        if (activeSection) await fadeOut(activeSection);
        activeSection = section;
        if (section) await fadeIn(section);
    }

    heroSection.addEventListener('click', () => showSection(null));

    navLinks.forEach(link => {
        const target = document.getElementById(link.dataset.section);
        link.addEventListener('click', e => {
            e.preventDefault();
            showSection(target);
        });
    });
}
