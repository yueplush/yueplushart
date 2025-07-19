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
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const maxR = Math.min(width, height) * 0.4;
        const layers = 10;

        for (let i = 0; i < layers; i++) {
            const progress = i / layers;
            const radius = maxR * progress * (1 + 0.1 * Math.sin(t * 0.02 + i));
            const sides = 5 + (i % 5);
            ctx.beginPath();
            for (let j = 0; j <= sides; j++) {
                const angle = t * 0.01 * (i + 1) + j * Math.PI * 2 / sides;
                const x = cx + radius * Math.cos(angle);
                const y = cy + radius * Math.sin(angle);
                j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            const hue = (t + i * 36) % 360;
            ctx.strokeStyle = `hsla(${hue}, 70%, 55%, 0.8)`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        t += 0.5;
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
