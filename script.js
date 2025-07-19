document.addEventListener('DOMContentLoaded', () => {
    const backgroundAnimation = document.querySelector('.background-animation');
    const navLinks = document.querySelectorAll('nav ul li a:not(.patreon-button)');
    const heroSection = document.getElementById('hero');

    let currentActiveSectionId = 'hero'; // Track the currently active section ID

    // Initial display: hero section only
    heroSection.classList.add('visible');

    // hero section disappears on click
    heroSection.addEventListener('click', () => {
        if (heroSection.classList.contains('visible')) {
            heroSection.classList.remove('visible');
            heroSection.classList.add('hidden');
            heroSection.addEventListener('transitionend', function handler() {
                heroSection.style.display = 'none';
                heroSection.removeEventListener('transitionend', handler);
            }, { once: true });
            currentActiveSectionId = ''; // heroが非表示になったらアクティブセクションをリセット
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.dataset.section;
            const targetSection = document.getElementById(targetSectionId);

            // クリックされたセクションが既にアクティブな場合は何もしない
            if (targetSectionId === currentActiveSectionId) {
                return;
            }

            // heroセクションがまだ表示されている場合は、それを非表示にする
            if (heroSection.classList.contains('visible')) {
                heroSection.classList.remove('visible');
                heroSection.classList.add('hidden');
                heroSection.addEventListener('transitionend', function handler() {
                    heroSection.style.display = 'none';
                    heroSection.removeEventListener('transitionend', handler);
                }, { once: true });
                currentActiveSectionId = ''; // heroが非表示になったらアクティブセクションをリセット
            }

            // 現在表示されているコンテンツセクションを非表示にする
            document.querySelectorAll('.content-section.visible').forEach(visibleSection => {
                visibleSection.classList.remove('visible');
                visibleSection.classList.add('hidden');

                // Set display: none after transition completes
                visibleSection.addEventListener('transitionend', function handler() {
                    visibleSection.style.display = 'none';
                    visibleSection.removeEventListener('transitionend', handler);
                }, { once: true });
            });

            // 新しいセクションを表示
            if (targetSection) {
                targetSection.style.display = 'block';

                // Force reflow
                targetSection.offsetWidth; 

                // Trigger transition
                targetSection.classList.remove('hidden');
                targetSection.classList.add('visible');

                currentActiveSectionId = targetSectionId; // Update active section
            }
        });
    });
});
