document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    createFireflyAnimation();
    initArtworkFilters();
});

function createFireflyAnimation() {
    const container = document.querySelector('.background-animation');
    if (!container) return;

    const COUNT = 40;
    const flies = [];

    for (let i = 0; i < COUNT; i++) {
        const el = document.createElement('div');
        el.className = 'firefly';
        container.appendChild(el);
        const size = Math.random() * 4 + 4;
        const hue = Math.floor(Math.random() * 60 + 40);
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.background = `radial-gradient(circle, hsla(${hue},100%,70%,1) 0%, hsla(${hue},100%,70%,0.3) 60%, hsla(${hue},100%,70%,0) 100%)`;
        el.style.boxShadow = `0 0 6px 2px hsla(${hue},100%,65%,0.8)`;
        const depth = Math.random() * 0.7 + 0.3;
        flies.push({
            el,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            z: depth,
            vx: (Math.random() - 0.5) * 0.6 * depth,
            vy: (Math.random() - 0.5) * 0.6 * depth
        });
    }

    function animate() {
        flies.forEach(f => {
            f.x += f.vx;
            f.y += f.vy;
            f.vx += (Math.random() - 0.5) * 0.02;
            f.vy += (Math.random() - 0.5) * 0.02;
            const max = 0.3 * f.z;
            if (f.vx > max) f.vx = max;
            if (f.vx < -max) f.vx = -max;
            if (f.vy > max) f.vy = max;
            if (f.vy < -max) f.vy = -max;
            if (f.x < -50) f.x = window.innerWidth + 50;
            if (f.x > window.innerWidth + 50) f.x = -50;
            if (f.y < -50) f.y = window.innerHeight + 50;
            if (f.y > window.innerHeight + 50) f.y = -50;
            const scale = 0.5 + (1 - f.z);
            f.el.style.transform = `translate(${f.x}px, ${f.y}px) scale(${scale})`;
        });
        requestAnimationFrame(animate);
    }

    animate();
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

    const menu = nav.querySelector('ul');

    function openMenu() {
        menu.style.display = 'flex';
        void menu.offsetWidth; // reflow for transition
        nav.classList.add('open');
    }

    function closeMenu() {
        if (!nav.classList.contains('open')) return;
        nav.classList.add('closing');
        nav.classList.remove('open');
        menu.addEventListener('transitionend', function handler(e) {
            if (e.target === menu) {
                menu.style.display = 'none';
                nav.classList.remove('closing');
                menu.removeEventListener('transitionend', handler);
            }
        });
    }

    function toggleMenu() {
        if (nav.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(link => {
        const target = document.getElementById(link.dataset.section);
        link.addEventListener('click', e => {
            e.preventDefault();
            showSection(target);
            if (nav.classList.contains('open')) {
                closeMenu();
            }
        });
    });
}

function initArtworkFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const subFilters = document.querySelector('.sub-filters');
    const subBtns = document.querySelectorAll('.sub-btn');
    const items = document.querySelectorAll('.artwork-item');
    const popup = document.getElementById('suggestive-popup');
    const adultCheck = document.getElementById('adult-check');
    const confirmBtn = document.getElementById('confirm-adult');

    let adultOk = false;
    let currentFilter = 'all';
    let currentSub = '';

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            if (currentFilter === 'suggestive' && !adultOk) {
                showPopup();
            } else {
                applyFilters();
                if (currentFilter === 'suggestive') {
                    subFilters.classList.remove('hidden');
                } else {
                    subFilters.classList.add('hidden');
                }
            }
        });
    });

    subBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            subBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSub = btn.dataset.sub;
            applyFilters();
        });
    });

    adultCheck.addEventListener('change', () => {
        confirmBtn.disabled = !adultCheck.checked;
    });

    confirmBtn.addEventListener('click', () => {
        adultOk = true;
        hidePopup();
        subFilters.classList.remove('hidden');
        applyFilters();
    });

    function showPopup() {
        popup.classList.remove('hidden');
        void popup.offsetWidth;
        popup.classList.add('visible');
    }

    function hidePopup() {
        popup.classList.remove('visible');
        popup.addEventListener('transitionend', function handler(e) {
            if (e.target === popup) {
                popup.classList.add('hidden');
                popup.removeEventListener('transitionend', handler);
                adultCheck.checked = false;
                confirmBtn.disabled = true;
            }
        });
    }

    function applyFilters() {
        items.forEach(item => {
            const tags = item.dataset.tags.split(' ');
            const matchesFilter = currentFilter === 'all' || tags.includes(currentFilter);
            const matchesSub = !currentSub || tags.includes(currentSub);
            item.style.display = (matchesFilter && matchesSub) ? 'block' : 'none';
        });
    }
}
