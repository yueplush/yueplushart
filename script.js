document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    createFireflyAnimation();
});
function createFireflyAnimation() {
    const canvas = document.getElementById('firefly-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const fireflies = [];
    const COUNT = 40;

    for (let i = 0; i < COUNT; i++) {
        fireflies.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.7,
            r: Math.random() * 2 + 1,
            phase: Math.random() * Math.PI * 2
        });
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'lighter';

        fireflies.forEach(f => {
            f.x += f.vx;
            f.y += f.vy;
            f.phase += 0.05;

            if (f.x < 0 || f.x > width) f.vx *= -1;
            if (f.y < 0 || f.y > height) f.vy *= -1;

            const glow = (Math.sin(f.phase) + 1) / 2;
            const radius = f.r + glow * 1.5;
            const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, radius);
            gradient.addColorStop(0, `rgba(255,255,200,${0.8 * glow})`);
            gradient.addColorStop(1, 'rgba(255,255,200,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(f.x, f.y, radius, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalCompositeOperation = 'source-over';
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
