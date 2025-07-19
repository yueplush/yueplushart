document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    createBubbleAnimation();
});

function createBubbleAnimation() {
    const container = document.querySelector('.background-animation');
    if (!container) return;

    const COUNT = 40;
    for (let i = 0; i < COUNT; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const size = 20 + Math.random() * 60;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.setProperty('--duration', `${15 + Math.random() * 10}s`);
        bubble.style.animationDelay = `${Math.random() * -20}s`;
        bubble.addEventListener('animationiteration', () => {
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.setProperty('--duration', `${15 + Math.random() * 10}s`);
        });
        container.appendChild(bubble);
    }
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
