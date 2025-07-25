(() => {
    'use strict';

    const PASSIVE = Object.freeze({ passive: true });
    const POINTER_EVENTS = ['click', 'touchstart'];
    const addEvents = (el, events, handler, opts) => events.forEach(ev => el.addEventListener(ev, handler, opts));
    const removeEvents = (el, events, handler, opts) => events.forEach(ev => el.removeEventListener(ev, handler, opts));

    const Utils = {
        waitForTransition(element) {
            return new Promise(resolve => {
                const onEnd = e => {
                    if (e.target === element) {
                        resolve();
                    }
                };
                element.addEventListener('transitionend', onEnd, { once: true, ...PASSIVE });
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
            const infoSection = document.getElementById('info');
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
                menu.addEventListener('transitionend', onEnd, { once: true, ...PASSIVE });
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

            heroSection.addEventListener('click', () => {
                if (infoSection) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    const infoLink = document.querySelector('nav a[data-section="info"]');
                    if (infoLink) infoLink.classList.add('active');
                }
                showSection(infoSection);
            }, PASSIVE);
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
            const filterContainer = document.querySelector('.artwork-filters');
            const subContainer = document.querySelector('.sub-filters');
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

            if (filterContainer) {
                filterContainer.addEventListener('click', e => {
                    const btn = e.target.closest('.filter-btn');
                    if (!btn) return;
                    prevFilterBtn = document.querySelector('.filter-btn.active');
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.dataset.filter;

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
            }

            if (subContainer) {
                subContainer.addEventListener('click', e => {
                    const btn = e.target.closest('.sub-btn');
                    if (!btn) return;
                    subBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentSub = btn.dataset.sub;
                    applyFilters();
                });
            }

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
                    { once: true, ...PASSIVE }
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
            { once: true, ...PASSIVE }
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
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
    window.addEventListener('resize', onResize, PASSIVE);
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
            }, { rootMargin: '200px 0px' });

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

    const CodeCopy = {
        init() {
            const box = document.getElementById('banner-code-box');
            if (!box || !navigator.clipboard) return;
            box.addEventListener('click', () => {
                const text = box.textContent.trim();
                navigator.clipboard.writeText(text).then(() => {
                    box.classList.add('copied');
                    setTimeout(() => box.classList.remove('copied'), 1000);
                }).catch(() => {});
            });
        }
    };

    const BOOT_LINES = Object.freeze([
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
    ]);

    const BootScreen = {
        init() {
            const boot = document.getElementById('boot-screen');
            const crt = document.getElementById('crt-overlay');
            const filter = document.getElementById('crt-distortion');
            if (!boot) return;

            if (filter) {
                const applyCfg = cfg => {
                    const turb = filter.querySelector('feTurbulence');
                    const disp = filter.querySelector('feDisplacementMap');
                    if (turb && cfg.baseFrequencyX && cfg.baseFrequencyY) {
                        turb.setAttribute('baseFrequency', `${cfg.baseFrequencyX} ${cfg.baseFrequencyY}`);
                    }
                    if (disp && cfg.scale) {
                        disp.setAttribute('scale', cfg.scale);
                    }
                };

                const cached = sessionStorage.getItem('bootConfig');
                if (cached) {
                    try {
                        const cfg = JSON.parse(cached);
                        if (cfg && cfg.crt) applyCfg(cfg.crt);
                    } catch (e) { /* ignore */ }
                } else {
                    fetch('boot-config.json')
                        .then(r => r.ok ? r.json() : null)
                        .then(cfg => {
                            if (cfg && cfg.crt) {
                                sessionStorage.setItem('bootConfig', JSON.stringify(cfg));
                                applyCfg(cfg.crt);
                            }
                        })
                        .catch(() => {});
                }
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
                removeEvents(boot, POINTER_EVENTS, finishBoot, PASSIVE);
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

            addEvents(boot, POINTER_EVENTS, finishBoot, PASSIVE);

            addLine();
        }
    };

    const BotDetector = {
        isLikelyBot() {
            const ua = navigator.userAgent.toLowerCase();
            if (/bot|crawl|spider|headless|scrape/.test(ua)) return true;
            if (navigator.webdriver) return true;
            if (!navigator.plugins || navigator.plugins.length === 0) return true;
            if (!navigator.mimeTypes || navigator.mimeTypes.length === 0) return true;
            if (!navigator.languages || navigator.languages.length === 0) return true;
            if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 1) return true;
            if (window.outerWidth === 0 || window.outerHeight === 0) return true;
            if (!window.requestAnimationFrame) return true;
            if (/android|iphone|ipad|mobile/.test(ua) && navigator.maxTouchPoints === 0) return true;
            if (navigator.userAgentData) {
                const brands = navigator.userAgentData.brands
                    .map(b => b.brand.toLowerCase())
                    .join(' ');
                if (/bot|headless/.test(brands)) return true;
                if (navigator.userAgentData.mobile === false && /android|iphone|ipad/.test(ua) && navigator.maxTouchPoints === 0) return true;
            }
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (!tz) return true;
            } catch (e) {
                return true;
            }
            return false;
        }
    };

    const AntiScrape = {
        xorDecode(enc, key) {
            const bin = atob(enc);
            let out = '';
            for (let i = 0; i < bin.length; i++) {
                out += String.fromCharCode(bin.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return out;
        },
        decodeImages() {
            const parts = ['c', '2', 'V', 'j', 'cmV0'];
            const key = atob(parts.join(''));
            document.querySelectorAll('img[data-x1]').forEach(img => {
                const enc = (img.dataset.x1 || '') + (img.dataset.x2 || '') +
                            (img.dataset.x3 || '') + (img.dataset.x4 || '');
                if (!enc) return;
                try {
                    img.src = AntiScrape.xorDecode(enc, key);
                    ['x1','x2','x3','x4'].forEach(p => img.removeAttribute('data-' + p));
                } catch (e) {
                    // ignore invalid data
                }
            });
        },
        init() {
            if (BotDetector.isLikelyBot()) return;
            const pageLoad = performance.now();
            let firstTime = 0;
            let interactions = 0;
            const trigger = () => {
                const now = performance.now();
                const sinceLoad = now - pageLoad;
                if (sinceLoad < 100) return; // ignore suspiciously fast interaction
                if (!firstTime) {
                    firstTime = now;
                    interactions = 1;
                    return;
                }
                if (now - firstTime < 300) {
                    interactions++;
                    return;
                }
                if (interactions < 2) return;
                setTimeout(AntiScrape.decodeImages, 1000 + Math.random() * 1000);
                events.forEach(ev => window.removeEventListener(ev, trigger));
            };
            const events = ['mousemove', 'scroll', 'keydown', 'touchstart'];
            events.forEach(ev => window.addEventListener(ev, trigger, PASSIVE));
        }
    };

    const RightClickBlocker = {
        init() {
            document.addEventListener('contextmenu', e => {
                e.preventDefault();
            });
            document.addEventListener('mousedown', e => {
                if (e.button === 2) {
                    e.preventDefault();
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
            CodeCopy.init();
            RightClickBlocker.init();
        }
    };

    document.addEventListener('DOMContentLoaded', App.init);

})();
