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
