document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initArtworkFilters();
    initLightbox();
    initBubbleAnimation();
});
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

    // Initially hide suggestive artwork from the "ALL" view
    applyFilters();

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;

            // Reset sub category selection when switching filters
            subBtns.forEach(b => b.classList.remove('active'));
            currentSub = '';

            if (currentFilter === 'suggestive' && !adultOk) {
                showPopup();
            } else {
                if (currentFilter === 'suggestive') {
                    subFilters.classList.remove('hidden');
                } else {
                    subFilters.classList.add('hidden');
                }
                applyFilters();
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
        subBtns.forEach(b => b.classList.remove('active'));
        currentSub = '';
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
            const isSuggestive = tags.includes('suggestive');

            let visible = matchesFilter && matchesSub;
            if (currentFilter === 'suggestive' && !currentSub) {
                visible = false;
            }
            if (currentFilter === 'all' && !adultOk && isSuggestive) {
                visible = false;
            }

            item.style.display = visible ? 'block' : 'none';
        });
    }
}

function initLightbox() {
    const items = document.querySelectorAll('.artwork-item');
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (!lightbox) return;

    function closeLightbox() {
        lightbox.classList.remove('visible');
        lightbox.addEventListener('transitionend', function handler(ev) {
            if (ev.target === lightbox) {
                lightbox.classList.add('hidden');
                lightbox.removeEventListener('transitionend', handler);
            }
        });
    }

    items.forEach(item => {
        item.addEventListener('click', () => {
            const itemImg = item.querySelector('img');
            img.src = itemImg.src;
            img.alt = itemImg.alt;
            title.textContent = item.dataset.title || item.querySelector('p')?.textContent || '';
            desc.textContent = item.dataset.desc || '';
            lightbox.classList.remove('hidden');
            void lightbox.offsetWidth;
            lightbox.classList.add('visible');
        });
    });

    if (isMobile) {
        img.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

function initBubbleAnimation() {
    const canvas = document.getElementById('bubble-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const bubbleCount = 40;
    const bubbles = [];

    function createBubble() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            r: 2 + Math.random() * 6,
            speed: 0.5 + Math.random() * 1.5,
            drift: (Math.random() * 2 - 1) * 0.5,
            alpha: 0.2 + Math.random() * 0.4
        };
    }

    for (let i = 0; i < bubbleCount; i++) {
        bubbles.push(createBubble());
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        bubbles.forEach(b => {
            b.y -= b.speed;
            b.x += b.drift;
            if (b.y + b.r < 0) {
                b.y = height + b.r;
                b.x = Math.random() * width;
            }
            ctx.save();
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            gradient.addColorStop(0, `rgba(255,255,200,${b.alpha})`);
            gradient.addColorStop(0.7, `rgba(255,255,150,${b.alpha * 0.6})`);
            gradient.addColorStop(1, 'rgba(255,255,100,0)');
            ctx.fillStyle = gradient;
            ctx.shadowColor = `rgba(255,255,150,${b.alpha})`;
            ctx.shadowBlur = b.r * 2;
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        requestAnimationFrame(draw);
    }
    draw();
}
