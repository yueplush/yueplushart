document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    createFireflyAnimation();
    createGeometricAnimation();
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

    const COUNT = 40;
    const fireflies = Array.from({ length: COUNT }, () => createFirefly());

    function createFirefly() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: 1 + Math.random() * 2,
            blink: Math.random() * 360
        };
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.shadowBlur = 8;
        fireflies.forEach(f => {
            f.x += f.vx;
            f.y += f.vy;
            if (f.x < 0) f.x += width; else if (f.x > width) f.x -= width;
            if (f.y < 0) f.y += height; else if (f.y > height) f.y -= height;
            f.blink += 2;
            const alpha = 0.5 + 0.5 * Math.sin(f.blink * Math.PI / 180);
            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,200,${alpha})`;
            ctx.shadowColor = `rgba(255,255,200,${alpha})`;
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}

function createGeometricAnimation() {
    const container = document.querySelector('.background-animation');
    if (!container) return;

    const canvas = document.getElementById('geo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let t = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const maxRadius = Math.min(cx, cy) * 0.8;
        const shapes = 7;
        for (let i = 0; i < shapes; i++) {
            const progress = i / shapes;
            const radius = maxRadius * progress;
            const sides = 3 + i;
            const hue = (t * 30 + progress * 360) % 360;
            ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let j = 0; j <= sides; j++) {
                const angle = t * 0.5 + j * Math.PI * 2 / sides;
                const r = radius * (1 + 0.1 * Math.sin(t + j * 2));
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        t += 0.01;
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}

function initNavigation() {
    const navLinks = document.querySelectorAll('nav a[data-section]');
    const heroSection = document.getElementById('hero');
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('header nav');
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

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
        });
    }

    navLinks.forEach(link => {
        const target = document.getElementById(link.dataset.section);
        link.addEventListener('click', e => {
            e.preventDefault();
            showSection(target);
            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
            }
        });
    });
}
