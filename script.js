(() => {
    'use strict';

    const Utils = {
        waitForTransition(element) {
            return new Promise(resolve => {
                const onEnd = e => {
                    if (e.target === element) {
                        resolve();
                    }
                };
                element.addEventListener('transitionend', onEnd, { once: true });
            });
        },
        async fadeOut(element) {
            element.classList.remove('visible');
            element.classList.add('hidden');
            await Utils.waitForTransition(element);
            element.style.display = 'none';
        },
        fadeIn(element) {
            element.style.display = 'block';
            void element.offsetWidth;
            element.classList.remove('hidden');
            element.classList.add('visible');
            return Utils.waitForTransition(element);
        }
    };

    const Navigation = {
        init() {
            const navLinks = document.querySelectorAll('nav a[data-section]');
            const heroSection = document.getElementById('hero');
            const aboutDecor = document.getElementById('about-decor');
            const menuToggle = document.querySelector('.menu-toggle');
            const nav = document.querySelector('header nav');
            let activeSection = null;

            document.querySelectorAll('.content-section.hidden').forEach(sec => {
                sec.style.display = 'none';
            });

            heroSection.classList.add('hidden');

           const menu = nav.querySelector('ul');
            let menuAnimating = false;

            const openMenu = () => {
                if (menuAnimating || nav.classList.contains('open')) return;
                menuAnimating = true;
                menu.style.display = 'flex';
                void menu.offsetWidth;
                nav.classList.remove('closing');
                nav.classList.add('open');
                setTimeout(() => {
                    menuAnimating = false;
                }, 350);
            };

            const closeMenu = () => {
                if (menuAnimating || !nav.classList.contains('open')) return;
                menuAnimating = true;
                nav.classList.add('closing');
                nav.classList.remove('open');
                const onEnd = e => {
                    if (e && e.target !== menu) return;
                    menu.style.display = 'none';
                    nav.classList.remove('closing');
                    menuAnimating = false;
                };
                menu.addEventListener('transitionend', onEnd, { once: true });
                setTimeout(onEnd, 400);
            };

            const toggleMenu = () => {
                if (menuAnimating) return;
                nav.classList.contains('open') ? closeMenu() : openMenu();
            };

            const showSection = async section => {
                if (activeSection === section) return;
                if (activeSection) await Utils.fadeOut(activeSection);
                activeSection = section;
                if (section) await Utils.fadeIn(section);
                if (section && section.id === 'my-artwork') {
                    LazyLoadArtwork.init();
                }

                if (aboutDecor && window.matchMedia('(min-width: 601px)').matches) {
                    if (section === heroSection) {
                        Utils.fadeOut(aboutDecor);
                    } else {
                        Utils.fadeIn(aboutDecor);
                    }
                } else if (aboutDecor) {
                    Utils.fadeOut(aboutDecor);
                }
            };

            heroSection.addEventListener('click', () => showSection(null));
            document.addEventListener('bootFinished', () => {
                Utils.fadeIn(heroSection).then(() => {
                    activeSection = heroSection;
                });
            });

            if (menuToggle) {
                menuToggle.addEventListener('click', toggleMenu);
            }

            nav.addEventListener('click', e => {
                const link = e.target.closest('a[data-section]');
                if (!link) return;
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const target = document.getElementById(link.dataset.section);
                showSection(target);
                if (nav.classList.contains('open')) {
                    closeMenu();
                }
            });
        }
    };

    const ArtworkFilters = {
        init() {
            const filterBtns = document.querySelectorAll('.filter-btn');
            const subFilters = document.querySelector('.sub-filters');
            const subBtns = document.querySelectorAll('.sub-btn');
            const items = Array.from(document.querySelectorAll('.artwork-item'));
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
                popup.addEventListener(
                    'transitionend',
                    e => {
                        if (e.target === popup) {
                            popup.classList.add('hidden');
                            adultCheck.checked = false;
                            confirmBtn.disabled = true;
                        }
                    },
                    { once: true }
                );
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
                    if ((currentFilter === 'all' || currentFilter === 'commission') && !adultOk && isSuggestive) {
                        visible = false;
                    }

                    item.style.display = visible ? 'block' : 'none';
                });
            }
        }
    };

    const Lightbox = {
        init() {
            const gallery = document.querySelector('.artwork-gallery');
            const lightbox = document.getElementById('lightbox');
            const img = document.getElementById('lightbox-img');
            const title = document.getElementById('lightbox-title');
            const desc = document.getElementById('lightbox-desc');

    if (!lightbox) return;

    function closeLightbox() {
        lightbox.classList.remove('visible');
        lightbox.addEventListener(
            'transitionend',
            ev => {
                if (ev.target === lightbox) {
                    lightbox.classList.add('hidden');
                }
            },
            { once: true }
        );
    }

    if (gallery) {
        gallery.addEventListener('click', e => {
            const item = e.target.closest('.artwork-item');
            if (!item) return;
            const itemImg = item.querySelector('img');
            img.src = itemImg.src;
            img.alt = itemImg.alt;
            title.textContent = item.dataset.title || item.querySelector('p')?.textContent || '';
            desc.textContent = item.dataset.desc || '';
            lightbox.classList.remove('hidden');
            void lightbox.offsetWidth;
            lightbox.classList.add('visible');
        });
    }

    // Allow closing the lightbox by clicking on the image itself on all
    // devices including desktop and tablets.
    img.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
        }
    };

    const BubbleAnimation = {
        init() {
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
    };

    const LazyLoadArtwork = {
        initialized: false,
        init() {
            if (this.initialized) return;
            const images = document.querySelectorAll('#my-artwork .artwork-gallery img[data-src]');
            if (!images.length) return;
            this.initialized = true;

            const loadImg = img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                img.classList.remove('lazy');
            };

            if (!('IntersectionObserver' in window)) {
                images.forEach(loadImg);
                return;
            }

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadImg(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '100px 0px' });

            images.forEach(img => observer.observe(img));
        }
    };

    const ProfileToggle = {
        init() {
            const toggle = document.getElementById('profile-toggle');
            const details = document.getElementById('profile-details');
            if (!toggle || !details) return;
            toggle.addEventListener('click', () => {
                const hidden = details.classList.toggle('hidden');
                toggle.textContent = hidden ? 'Show Profiles' : 'Hide Profiles';
            });
        }
    };

    const BOOT_LINES = [
        'YUEPLUSH CYBER BIOS v1.0',
        '<span class="boot-blink">INITIALIZING...</span>',
        'Access from external network... <span class="boot-status">Approved</span>',
        'System boot... <span class="boot-status">Initialize</span>',
        'CPU... <span class="boot-status">OK</span>',
        'GPU... <span class="boot-status">OK</span>',
        'RAM... <span class="boot-status">OK</span>',
        'Storage... <span class="boot-status">OK</span>',
        'Security protocols... <span class="boot-status">Enabled</span>',
        'Welcome, stranger, take easy for moment',
        'Cybernetic link process v1.12 booted up, <span class="boot-status">Accepted</span>',
        '<span class="boot-blink">Screen changes...3...2...1...</span>'
    ];

    const BootScreen = {
        init() {
            const boot = document.getElementById('boot-screen');
            const crt = document.getElementById('crt-overlay');
            if (!boot) return;

            const container = boot.querySelector('.boot-container');
            let index = 0;
            const delay = 300;
            let timer;
            let finished = false;

            const finishBoot = () => {
                if (finished || boot.classList.contains('fade-out')) return;
                finished = true;
                clearTimeout(timer);
                boot.classList.add('fade-out');
                ['click', 'touchstart'].forEach(ev => boot.removeEventListener(ev, finishBoot));
                document.dispatchEvent(new Event('bootFinished'));
                if (crt) {
                    crt.classList.add('fade-out');
                    crt.addEventListener('animationend', () => crt.remove(), { once: true });
                }
                boot.addEventListener('animationend', () => boot.remove(), { once: true });
            };

            const addLine = () => {
                if (finished) return;
                if (index >= BOOT_LINES.length) {
                    timer = setTimeout(finishBoot, 1600);
                    return;
                }
                const div = document.createElement('div');
                div.className = 'boot-line';
                div.innerHTML = BOOT_LINES[index++];
                container.appendChild(div);
                timer = setTimeout(addLine, delay);
            };

            ['click', 'touchstart'].forEach(ev => boot.addEventListener(ev, finishBoot));

            addLine();
        }
    };

    const App = {
        init() {
            BootScreen.init();
            Navigation.init();
            ArtworkFilters.init();
            Lightbox.init();
            BubbleAnimation.init();
            ProfileToggle.init();
        }
    };

    document.addEventListener('DOMContentLoaded', App.init);

})();
