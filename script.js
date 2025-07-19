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
    const COUNT = 60;

    function createFirefly() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 1,
            phase: Math.random() * Math.PI * 2,
        };
    }

    for (let i = 0; i < COUNT; i++) {
        fireflies.push(createFirefly());
    }

    function update(f) {
        f.x += f.vx;
        f.y += f.vy;
        f.phase += 0.02;

        if (f.x < -10) f.x = width + 10;
        else if (f.x > width + 10) f.x = -10;
        if (f.y < -10) f.y = height + 10;
        else if (f.y > height + 10) f.y = -10;
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        for (const f of fireflies) {
            const flicker = 0.5 + 0.5 * Math.sin(f.phase);
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 200, ${0.3 + 0.7 * flicker})`;
            ctx.shadowColor = 'rgba(255, 255, 200, 0.8)';
            ctx.shadowBlur = 8 * flicker;
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            update(f);
        }

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
