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
                element.addEventListener('transitionend', onEnd, { once: true, passive: true });
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
                menu.addEventListener('transitionend', onEnd, { once: true, passive: true });
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

            heroSection.addEventListener('click', () => showSection(null), { passive: true });
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
            const items = Array.from(document.querySelectorAll('.artwork-item'))
                .map(el => ({ el, tags: el.dataset.tags.split(' ') }));
            const popup = document.getElementById('suggestive-popup');
            const adultCheck = document.getElementById('adult-check');
            const confirmBtn = document.getElementById('confirm-adult');

            let adultOk = false;
            let currentFilter = 'all';
            let currentSub = '';
            let prevFilterBtn = document.querySelector('.filter-btn.active');

            // Initially hide suggestive artwork from the "ALL" view
            applyFilters();

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    prevFilterBtn = document.querySelector('.filter-btn.active');
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

            function cancelPopup() {
                hidePopup();
                if (prevFilterBtn) {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    prevFilterBtn.classList.add('active');
                    currentFilter = prevFilterBtn.dataset.filter;
                } else {
                    currentFilter = 'all';
                }
                subFilters.classList.add('hidden');
                subBtns.forEach(b => b.classList.remove('active'));
                currentSub = '';
                applyFilters();
            }

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
                    { once: true, passive: true }
                );
            }

            popup.addEventListener('click', e => {
                if (e.target === popup) {
                    cancelPopup();
                }
            });

            function applyFilters() {
                items.forEach(({ el, tags }) => {
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

                    el.style.display = visible ? 'block' : 'none';
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
            { once: true, passive: true }
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
            let running = true;
            let rafId;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    let resizeScheduled = false;
    function onResize() {
        if (!resizeScheduled) {
            resizeScheduled = true;
            requestAnimationFrame(() => {
                resize();
                resizeScheduled = false;
            });
        }
    }
    window.addEventListener('resize', onResize, { passive: true });
    resize();

    const bubbleCount = 40;
    const xs = new Float32Array(bubbleCount);
    const ys = new Float32Array(bubbleCount);
    const rs = new Float32Array(bubbleCount);
    const speeds = new Float32Array(bubbleCount);
    const drifts = new Float32Array(bubbleCount);
    const alphas = new Float32Array(bubbleCount);

    function initBubble(i) {
        xs[i] = Math.random() * width;
        ys[i] = Math.random() * height;
        rs[i] = 2 + Math.random() * 6;
        speeds[i] = 0.5 + Math.random() * 1.5;
        drifts[i] = (Math.random() * 2 - 1) * 0.5;
        alphas[i] = 0.2 + Math.random() * 0.4;
    }

    for (let i = 0; i < bubbleCount; i++) {
        initBubble(i);
    }

    function draw() {
        if (!running) return;
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < bubbleCount; i++) {
            ys[i] -= speeds[i];
            xs[i] += drifts[i];
            if (ys[i] + rs[i] < 0) {
                ys[i] = height + rs[i];
                xs[i] = Math.random() * width;
            }
            ctx.save();
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(xs[i], ys[i], 0, xs[i], ys[i], rs[i]);
            const a = alphas[i];
            gradient.addColorStop(0, `rgba(255,255,200,${a})`);
            gradient.addColorStop(0.7, `rgba(255,255,150,${a * 0.6})`);
            gradient.addColorStop(1, 'rgba(255,255,100,0)');
            ctx.fillStyle = gradient;
            ctx.shadowColor = `rgba(255,255,150,${a})`;
            ctx.shadowBlur = rs[i] * 2;
            ctx.arc(xs[i], ys[i], rs[i], 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
        } else if (!running) {
            running = true;
            rafId = requestAnimationFrame(draw);
        }
    });
    }
};   

    const LazyLoadArtwork = {
        init() {
            const images = document.querySelectorAll('#my-artwork .artwork-gallery img');
            if (!images.length) return;

            const lazyImgs = [];
            images.forEach((img, idx) => {
                if (idx >= 6) {
                    img.dataset.src = img.src;
                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
                    img.classList.add('lazy');
                    img.setAttribute('loading', 'lazy');
                    img.setAttribute('decoding', 'async');
                    lazyImgs.push(img);
                }
            });

            if (!lazyImgs.length || !('IntersectionObserver' in window)) {
                lazyImgs.forEach(img => {
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        if (img.decode) img.decode().catch(() => {});
                        img.classList.remove('lazy');
                    }
                });
                return;
            }

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            if (img.decode) img.decode().catch(() => {});
                        }
                        img.classList.remove('lazy');
                        obs.unobserve(img);
                    }
                });
            }, { rootMargin: '100px 0px' });

            lazyImgs.forEach(img => observer.observe(img));
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
            const filter = document.getElementById('crt-distortion');
            if (!boot) return;

            if (filter) {
                fetch('boot-config.json')
                    .then(r => r.ok ? r.json() : null)
                    .then(cfg => {
                        if (!cfg || !cfg.crt) return;
                        const turb = filter.querySelector('feTurbulence');
                        const disp = filter.querySelector('feDisplacementMap');
                        if (turb && cfg.crt.baseFrequencyX && cfg.crt.baseFrequencyY) {
                            turb.setAttribute('baseFrequency', `${cfg.crt.baseFrequencyX} ${cfg.crt.baseFrequencyY}`);
                        }
                        if (disp && cfg.crt.scale) {
                            disp.setAttribute('scale', cfg.crt.scale);
                        }
                    })
                    .catch(() => {});
            }

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
                const evtOpts = { passive: true };
                ['click', 'touchstart'].forEach(ev => boot.removeEventListener(ev, finishBoot, evtOpts));
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

            const evtOpts = { passive: true };
            ['click', 'touchstart'].forEach(ev => boot.addEventListener(ev, finishBoot, evtOpts));

            addLine();
        }
    };

    const AntiScrape = {
        init() {
            document.querySelectorAll('img[data-enc-src]').forEach(img => {
                const enc = img.dataset.encSrc;
                if (!enc) return;
                try {
                    img.src = atob(enc);
                    img.removeAttribute('data-enc-src');
                } catch (e) {
                    // ignore invalid data
                }
            });
        }
    };

    const App = {
        init() {
            AntiScrape.init();
            BootScreen.init();
            Navigation.init();
            ArtworkFilters.init();
            LazyLoadArtwork.init();
            Lightbox.init();
            BubbleAnimation.init();
            ProfileToggle.init();
        }
    };

    document.addEventListener('DOMContentLoaded', App.init);

})();
